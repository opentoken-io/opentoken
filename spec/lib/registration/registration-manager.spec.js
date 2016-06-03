"use strict";

describe("registrationManager", () => {
    var accountManagerMock, emailMock, factory, promiseMock, randomMock, registrationServiceMock, totpMock;

    beforeEach(() => {
        promiseMock = require("../../mock/promise-mock")();
        accountManagerMock = require("../../mock/account-manager-mock")();
        emailMock = require("../../mock/email-mock")();
        randomMock = require("../../mock/random-mock")();
        registrationServiceMock = jasmine.createSpyObj("registrationServiceMock", [
            "delAsync",
            "getAsync",
            "putAsync"
        ]);
        registrationServiceMock.delAsync.andReturn(promiseMock.resolve());
        registrationServiceMock.getAsync.andReturn(promiseMock.resolve({
            confirmationCode: "code",
            email: "user@example.com",
            extraProperty: "discarded when saved as an account",
            passwordHash: "hashed password",
            passwordHashConfig: "passwordHashConfig",
            totp: {
                key: "totp key"
            },
            totpConfirmed: false
        }));
        registrationServiceMock.putAsync.andReturn(promiseMock.resolve());
        totpMock = jasmine.createSpyObj("totpMock", [
            "generateQrCodeAsync",
            "generateSecretAsync",
            "verifyCurrentAndPrevious"
        ]);
        totpMock.generateQrCodeAsync.andReturn(promiseMock.resolve(new Buffer("png data", "binary")));
        totpMock.generateSecretAsync.andReturn(promiseMock.resolve("base32 secret"));
        totpMock.verifyCurrentAndPrevious.andReturn(true);
        factory = (override) => {
            var config;

            override = override || {};
            config = {
                account: {},
                registration: {
                    confirmationCodeLength: 5,
                    idLength: 8
                }
            };

            return require("../../../lib/registration/registration-manager")(accountManagerMock, config, emailMock, promiseMock, randomMock, registrationServiceMock, totpMock);
        };
    });
    it("exposes known functions", () => {
        expect(factory()).toEqual({
            confirmEmailAsync: jasmine.any(Function),
            qrCodeImageAsync: jasmine.any(Function),
            registerAsync: jasmine.any(Function),
            secureAsync: jasmine.any(Function),
            secureInfoAsync: jasmine.any(Function)
        });
    });
    describe(".confirmEmailAsync", () => {
        beforeEach(() => {
            registrationServiceMock.getAsync.andReturn(promiseMock.resolve({
                confirmationCode: "code",
                email: "user@example.com",
                passwordHash: "hashed password",
                passwordHashConfig: "passwordHashConfig",
                totp: {
                    key: "totp key"
                },
                totpConfirmed: true
            }));
        });
        it("fails if the record was not secured (passwordHash)", (done) => {
            registrationServiceMock.getAsync.andReturn(promiseMock.resolve({
                confirmationCode: "code",
                totpConfirmed: true
            }));
            factory().confirmEmailAsync("id", "code").then(() => {
                jasmine.fail();
                done();
            }, (result) => {
                expect(result).toEqual(jasmine.any(Error));
                expect(accountManagerMock.createAsync).not.toHaveBeenCalled();
                expect(registrationServiceMock.delAsync).not.toHaveBeenCalled();
                done();
            });
        });
        it("fails if the record was not secured (totpConfirmed)", (done) => {
            registrationServiceMock.getAsync.andReturn(promiseMock.resolve({
                confirmationCode: "code",
                passwordHash: "hash"
            }));
            factory().confirmEmailAsync("id", "code").then(() => {
                jasmine.fail();
                done();
            }, (result) => {
                expect(result).toEqual(jasmine.any(Error));
                expect(accountManagerMock.createAsync).not.toHaveBeenCalled();
                expect(registrationServiceMock.delAsync).not.toHaveBeenCalled();
                done();
            });
        });
        it("fails if confirmation code is wrong", (done) => {
            factory().confirmEmailAsync("id", "wrong code").then(() => {
                jasmine.fail();
                done();
            }, (result) => {
                expect(result).toEqual(jasmine.any(Error));
                expect(accountManagerMock.createAsync).not.toHaveBeenCalled();
                expect(registrationServiceMock.delAsync).not.toHaveBeenCalled();
                done();
            });
        });
        it("will not delete if creation goes awry", (done) => {
            accountManagerMock.createAsync.andReturn(promiseMock.reject("err"));
            factory().confirmEmailAsync("id", "code").then(() => {
                jasmine.fail();
                done();
            }, (result) => {
                expect(result).toBe("err");
                expect(accountManagerMock.createAsync).toHaveBeenCalledWith({
                    email: "user@example.com",
                    passwordHash: "hashed password",
                    passwordHashConfig: "passwordHashConfig",
                    totp: {
                        key: "totp key"
                    }
                });
                expect(registrationServiceMock.delAsync).not.toHaveBeenCalled();
                done();
            });
        });
        it("saves successfully", (done) => {
            factory().confirmEmailAsync("id", "code").then((result) => {
                expect(registrationServiceMock.getAsync).toHaveBeenCalledWith("id");

                // Note: some properties have been removed intentionally.
                expect(accountManagerMock.createAsync).toHaveBeenCalledWith({
                    email: "user@example.com",
                    passwordHash: "hashed password",
                    passwordHashConfig: "passwordHashConfig",
                    totp: {
                        key: "totp key"
                    }
                });
                expect(registrationServiceMock.delAsync).toHaveBeenCalledWith("id");
                expect(result).toEqual("createdId");
            }).then(done, done);
        });
    });
    describe(".qrCodeImageAsync", () => {
        it("does not generate a code if the get fails", (done) => {
            registrationServiceMock.getAsync.andReturn(promiseMock.reject("err"));
            factory().qrCodeImageAsync("id").then(() => {
                jasmine.fail();
                done();
            }, (err) => {
                expect(totpMock.generateQrCodeAsync).not.toHaveBeenCalled();
                expect(err).toBe("err");
                done();
            });
        });
        it("generates a QR code as a buffer", (done) => {
            factory().qrCodeImageAsync("id").then((result) => {
                expect(registrationServiceMock.getAsync).toHaveBeenCalledWith("id");
                expect(totpMock.generateQrCodeAsync).toHaveBeenCalledWith("totp key", "user@example.com");
                expect(Buffer.isBuffer(result)).toBe(true);
                expect(result.toString("binary")).toBe("png data");
            }).then(done, done);
        });
    });
    describe(".registerAsync", () => {
        it("starts a registration", (done) => {
            factory().registerAsync({
                email: "someone@example.net"
            }).then((result) => {
                expect(registrationServiceMock.putAsync).toHaveBeenCalledWith("BBBBBBBB", {
                    confirmationCode: "BBBBB",
                    email: "someone@example.net",
                    passwordHashConfig: "accountManager.passwordHashConfig",
                    totp: {
                        key: "base32 secret"
                    },
                    totpConfirmed: false
                });
                expect(result).toEqual({
                    id: "BBBBBBBB",
                    secureInfo: {
                        passwordHashConfig: "accountManager.passwordHashConfig",
                        totp: {
                            key: "base32 secret"
                        }
                    }
                });
            }).then(done, done);
        });
    });
    describe(".secureAsync", () => {
        var serverMock;

        beforeEach(() => {
            serverMock = require("../../mock/server-mock")();
        });
        it("fails on invalid TOTP keys", (done) => {
            totpMock.verifyCurrentAndPrevious.andReturn(false);
            factory().secureAsync("id", {
                totp: {
                    current: "000000",
                    previous: "111111"
                }
            }, serverMock).then(() => {
                jasmine.fail();
                done();
            }, (err) => {
                expect(totpMock.verifyCurrentAndPrevious).toHaveBeenCalledWith("totp key", "000000", "111111");
                expect(registrationServiceMock.putAsync).not.toHaveBeenCalled();
                expect(err).toEqual(jasmine.any(Error));
                expect(err.toString()).toContain("TOTP validation failed");
                done();
            });
        });
        it("works", (done) => {
            factory().secureAsync("id", {
                passwordHash: "hashhash",
                totp: {
                    current: "000000",
                    previous: "111111"
                }
            }, serverMock).then(() => {
                expect(totpMock.verifyCurrentAndPrevious).toHaveBeenCalledWith("totp key", "000000", "111111");
                expect(registrationServiceMock.putAsync).toHaveBeenCalledWith("id", {
                    confirmationCode: "code",
                    email: "user@example.com",
                    extraProperty: "discarded when saved as an account",
                    passwordHash: "hashhash",
                    passwordHashConfig: "passwordHashConfig",
                    totp: {
                        key: "totp key"
                    },
                    totpConfirmed: true
                });
                expect(emailMock.sendTemplate).toHaveBeenCalledWith("user@example.com", "registration", {
                    confirmUrl: "rendered route: registration-confirm, code:\"code\", id:\"id\""
                });
            }).then(done, done);
        });
    });
    describe(".secureInfoAsync", () => {
        it("returns filtered information", (done) => {
            factory().secureInfoAsync("id").then((result) => {
                expect(registrationServiceMock.getAsync).toHaveBeenCalledWith("id");
                expect(result).toEqual({
                    id: "id",
                    secureInfo: {
                        passwordHashConfig: "passwordHashConfig",
                        totp: {
                            key: "totp key"
                        }
                    }
                });
            }).then(done, done);
        });
    });
});
