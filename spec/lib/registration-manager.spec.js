"use strict";

describe("registrationManager", () => {
    var accountManagerMock, emailMock, factory, promiseMock, randomMock, storageService, totpMock;

    beforeEach(() => {
        var encodingMock, storageServiceFactoryMock;

        encodingMock = require("../mock/encoding-mock")();
        promiseMock = require("../mock/promise-mock")();
        accountManagerMock = require("../mock/account-manager-mock")();
        emailMock = require("../mock/email-mock")();
        randomMock = require("../mock/random-mock")();
        storageServiceFactoryMock = require("../mock/storage-service-factory-mock")();
        storageService = storageServiceFactoryMock.instance;
        storageService.getAsync.andReturn(promiseMock.resolve({
            confirmationCode: "code",
            email: "user@example.com",
            extraProperty: "discarded when saved as an account",
            mfa: {
                totp: {
                    confirmed: false,
                    key: "totp key"
                }
            },
            passwordHash: "hashed password",
            passwordHashConfig: "passwordHashConfig"
        }));
        totpMock = require("../mock/mfa/totp-mock")();
        factory = (override) => {
            var config;

            override = override || {};
            config = {
                account: {},
                registration: {
                    confirmationCodeLength: 5,
                    idHash: {},
                    idLength: 8,
                    lifetime: {},
                    storagePrefix: "anything"
                }
            };

            return require("../../lib/registration-manager")(accountManagerMock, config, emailMock, encodingMock, promiseMock, randomMock, storageServiceFactoryMock, totpMock);
        };
    });
    it("exposes known functions", () => {
        expect(factory()).toEqual({
            confirmEmailAsync: jasmine.any(Function),
            getRecordAsync: jasmine.any(Function),
            qrCodeImageAsync: jasmine.any(Function),
            registerAsync: jasmine.any(Function),
            secureAsync: jasmine.any(Function)
        });
    });
    describe(".confirmEmailAsync", () => {
        beforeEach(() => {
            storageService.getAsync.andReturn(promiseMock.resolve({
                confirmationCode: "code",
                email: "user@example.com",
                mfa: {
                    totp: {
                        confirmed: true,
                        key: "totp key"
                    }
                },
                passwordHash: "hashed password",
                passwordHashConfig: "passwordHashConfig"
            }));
        });
        it("fails if the record was not secured (passwordHash)", (done) => {
            storageService.getAsync.andReturn(promiseMock.resolve({
                confirmationCode: "code",
                totpConfirmed: true
            }));
            factory().confirmEmailAsync("id", "code").then(() => {
                jasmine.fail();
                done();
            }, (result) => {
                expect(result).toEqual(jasmine.any(Error));
                expect(accountManagerMock.createAsync).not.toHaveBeenCalled();
                expect(storageService.delAsync).not.toHaveBeenCalled();
                done();
            });
        });
        it("fails if the record was not secured (totpConfirmed)", (done) => {
            storageService.getAsync.andReturn(promiseMock.resolve({
                confirmationCode: "code",
                passwordHash: "hash"
            }));
            factory().confirmEmailAsync("id", "code").then(() => {
                jasmine.fail();
                done();
            }, (result) => {
                expect(result).toEqual(jasmine.any(Error));
                expect(accountManagerMock.createAsync).not.toHaveBeenCalled();
                expect(storageService.delAsync).not.toHaveBeenCalled();
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
                expect(storageService.delAsync).not.toHaveBeenCalled();
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
                    mfa: {
                        totp: {
                            confirmed: true,
                            key: "totp key"
                        }
                    },
                    passwordHash: "hashed password",
                    passwordHashConfig: "passwordHashConfig",
                });
                expect(storageService.delAsync).not.toHaveBeenCalled();
                done();
            });
        });
        it("saves successfully", (done) => {
            factory().confirmEmailAsync("id", "code").then((result) => {
                expect(storageService.getAsync).toHaveBeenCalledWith("id");

                // Note: some properties have been removed intentionally.
                expect(accountManagerMock.createAsync).toHaveBeenCalledWith({
                    email: "user@example.com",
                    mfa: {
                        totp: {
                            confirmed: true,
                            key: "totp key"
                        }
                    },
                    passwordHash: "hashed password",
                    passwordHashConfig: "passwordHashConfig"
                });
                expect(storageService.delAsync).toHaveBeenCalledWith("id");
                expect(result).toEqual("createdId");
            }).then(done, done);
        });
    });
    describe(".qrCodeImageAsync", () => {
        it("does not generate a code if the get fails", (done) => {
            storageService.getAsync.andReturn(promiseMock.reject("err"));
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
                expect(storageService.getAsync).toHaveBeenCalledWith("id");
                expect(totpMock.generateQrCodeAsync).toHaveBeenCalledWith("totp key", "user@example.com");
                expect(Buffer.isBuffer(result)).toBe(true);
                expect(result.toString("binary")).toBe("QR CODE PNG");
            }).then(done, done);
        });
    });
    describe(".registerAsync", () => {
        it("starts a registration", (done) => {
            factory().registerAsync({
                email: "someone@example.net"
            }).then((result) => {
                expect(storageService.putAsync).toHaveBeenCalledWith("BBBBBBBB", {
                    confirmationCode: "BBBBB",
                    email: "someone@example.net",
                    mfa: {
                        totp: {
                            confirmed: false,
                            key: jasmine.any(Buffer)
                        }
                    },
                    passwordHashConfig: "accountManager.passwordHashConfig"
                });
                expect(result).toEqual({
                    id: "BBBBBBBB",
                    record: {
                        mfa: {
                            totp: {
                                keyBase32: "U0VDUkVU",
                                keyHex: "U0VDUkVU",
                                keyUri: "url"
                            }
                        },
                        passwordHashConfig: "accountManager.passwordHashConfig"
                    }
                });
            }).then(done, done);
        });
    });
    describe(".secureAsync", () => {
        var serverMock;

        beforeEach(() => {
            serverMock = require("../mock/server-mock")();
        });
        it("fails on invalid TOTP keys", (done) => {
            totpMock.verifyCurrentAndPrevious.andReturn(false);
            factory().secureAsync("id", {
                mfa: {
                    totp: {
                        current: "000000",
                        previous: "111111"
                    }
                }
            }, serverMock).then(() => {
                jasmine.fail();
                done();
            }, (err) => {
                expect(totpMock.verifyCurrentAndPrevious).toHaveBeenCalledWith("totp key", "000000", "111111");
                expect(storageService.putAsync).not.toHaveBeenCalled();
                expect(err).toEqual(jasmine.any(Error));
                expect(err.toString()).toContain("TOTP validation failed");
                done();
            });
        });
        it("works", (done) => {
            factory().secureAsync("id", {
                mfa: {
                    totp: {
                        current: "000000",
                        previous: "111111"
                    }
                },
                passwordHash: "hashhash"
            }, serverMock).then(() => {
                expect(totpMock.verifyCurrentAndPrevious).toHaveBeenCalledWith("totp key", "000000", "111111");
                expect(storageService.putAsync).toHaveBeenCalledWith("id", {
                    confirmationCode: "code",
                    email: "user@example.com",
                    extraProperty: "discarded when saved as an account",
                    mfa: {
                        totp: {
                            confirmed: true,
                            key: "totp key"
                        }
                    },
                    passwordHash: "hashhash",
                    passwordHashConfig: "passwordHashConfig"
                });
                expect(emailMock.sendTemplate).toHaveBeenCalledWith("user@example.com", "registration", {
                    confirmUrl: "rendered route: registration-confirm, code:\"code\", id:\"id\""
                });
            }).then(done, done);
        });
    });
    describe(".secureInfoAsync", () => {
        it("returns filtered information", (done) => {
            factory().getRecordAsync("id").then((result) => {
                expect(storageService.getAsync).toHaveBeenCalledWith("id");
                expect(result).toEqual({
                    id: "id",
                    record: {
                        passwordHashConfig: "passwordHashConfig",
                        mfa: {
                            totp: {
                                keyBase32: "dG90cCBrZXk=",
                                keyHex: "dG90cCBrZXk=",
                                keyUri: "url"
                            }
                        }
                    }
                });
            }).then(done, done);
        });
        it("does not return the totp if the record is confirmed", (done) => {
            storageService.getAsync.andReturn(promiseMock.resolve({
                confirmationCode: "code",
                email: "user@example.com",
                extraProperty: "discarded when saved as an account",
                mfa: {
                    totp: {
                        confirmed: true,
                        key: "totp key"
                    }
                },
                passwordHash: "hashed password",
                passwordHashConfig: "passwordHashConfig"
            }));
            factory().getRecordAsync("id").then((result) => {
                expect(result).toEqual({
                    id: "id",
                    record: {
                        passwordHashConfig: "passwordHashConfig"
                    }
                });
            }).then(done, done);
        });
    });
});
