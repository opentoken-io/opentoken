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
        it("fails if the record was not secured (passwordHash)", () => {
            storageService.getAsync.andReturn(promiseMock.resolve({
                confirmationCode: "code",
                mfa: {
                    totp: {
                        confirmed: true
                    }
                }
            }));

            return factory().confirmEmailAsync("id", "code").then(jasmine.fail, (result) => {
                expect(result).toEqual(jasmine.any(Error));
                expect(accountManagerMock.createAsync).not.toHaveBeenCalled();
                expect(storageService.deleteAsync).not.toHaveBeenCalled();
            });
        });
        it("fails if the record was not secured (totpConfirmed)", () => {
            storageService.getAsync.andReturn(promiseMock.resolve({
                confirmationCode: "code",
                passwordHash: "hash"
            }));

            return factory().confirmEmailAsync("id", "code").then(jasmine.fail, (result) => {
                expect(result).toEqual(jasmine.any(Error));
                expect(accountManagerMock.createAsync).not.toHaveBeenCalled();
                expect(storageService.deleteAsync).not.toHaveBeenCalled();
            });
        });
        it("fails if confirmation code is wrong", () => {
            return factory().confirmEmailAsync("id", "wrong code").then(jasmine.fail, (result) => {
                expect(result).toEqual(jasmine.any(Error));
                expect(accountManagerMock.createAsync).not.toHaveBeenCalled();
                expect(storageService.deleteAsync).not.toHaveBeenCalled();
            });
        });
        it("will not delete if creation goes awry", () => {
            accountManagerMock.createAsync.andReturn(promiseMock.reject("err"));

            return factory().confirmEmailAsync("id", "code").then(jasmine.fail, (result) => {
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
                    passwordHashConfig: "passwordHashConfig"
                });
                expect(storageService.deleteAsync).not.toHaveBeenCalled();
            });
        });
        it("saves successfully", () => {
            return factory().confirmEmailAsync("id", "code").then((result) => {
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
                expect(storageService.deleteAsync).toHaveBeenCalledWith("id");
                expect(result).toEqual("createdId");
            });
        });
    });
    describe(".qrCodeImageAsync", () => {
        it("does not generate a code if the get fails", () => {
            storageService.getAsync.andReturn(promiseMock.reject("err"));

            return factory().qrCodeImageAsync("id").then(jasmine.fail, (err) => {
                expect(totpMock.generateQrCodeAsync).not.toHaveBeenCalled();
                expect(err).toBe("err");
            });
        });
        it("does not generate a QR code when already confirmed", () => {
            return storageService.getAsync().then((record) => {
                record.mfa.totp.confirmed = true;
                storageService.getAsync.andReturn(promiseMock.resolve(record));

                return factory().qrCodeImageAsync("id");
            }).then(() => {
                jasmine.fail();
            }, (err) => {
                expect(totpMock.generateQrCodeAsync).not.toHaveBeenCalled();
                expect(err.toString()).toContain("Already confirmed");
            });
        });
        it("generates a QR code as a buffer", () => {
            return factory().qrCodeImageAsync("id").then((result) => {
                expect(storageService.getAsync).toHaveBeenCalledWith("id");
                expect(totpMock.generateQrCodeAsync).toHaveBeenCalledWith("totp key", "user@example.com");
                expect(Buffer.isBuffer(result)).toBe(true);
                expect(result.toString("binary")).toBe("QR CODE PNG");
            });
        });
    });
    describe(".registerAsync", () => {
        it("requires an email in the request", () => {
            return factory().registerAsync({}).then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Email is required");
            });
        });
        it("starts a registration", () => {
            return factory().registerAsync({
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
            });
        });
    });
    describe(".secureAsync", () => {
        var serverMock;

        beforeEach(() => {
            serverMock = require("../mock/server-mock")();
        });
        it("catches errors for when the request doesn't have MFA properties", () => {
            return factory().secureAsync("id", {}).then(jasmine.fail, (err) => {
                expect(err).toEqual(jasmine.any(TypeError));
            });
        });
        it("requires the request's MFA", () => {
            return factory().secureAsync("id", {
                mfa: {
                    totp: {}
                }
            }).then(jasmine.fail, (err) => {
                expect(err).toEqual(jasmine.any(TypeError));
            });
        });
        it("requires a password hash", () => {
            return factory().secureAsync("id", {
                mfa: {
                    totp: {
                        current: "000000",
                        previous: "111111"
                    }
                }
            }).then(jasmine.fail, (err) => {
                expect(err).toEqual(jasmine.any(TypeError));
            });
        });
        it("fails on invalid TOTP keys", () => {
            totpMock.verifyCurrentAndPrevious.andReturn(false);

            return factory().secureAsync("id", {
                mfa: {
                    totp: {
                        current: "000000",
                        previous: "111111"
                    }
                },
                passwordHash: "abcdefg"
            }, serverMock).then(jasmine.fail, (err) => {
                expect(totpMock.verifyCurrentAndPrevious).toHaveBeenCalledWith("totp key", "000000", "111111");
                expect(storageService.putAsync).not.toHaveBeenCalled();
                expect(err).toEqual(jasmine.any(Error));
                expect(err.toString()).toContain("TOTP validation failed");
            });
        });
        it("works", () => {
            return factory().secureAsync("id", {
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
            });
        });
    });
    describe(".getRecordAsync", () => {
        it("returns filtered information", () => {
            return factory().getRecordAsync("id").then((result) => {
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
            });
        });
        it("does not return the totp if the record is confirmed", () => {
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

            return factory().getRecordAsync("id").then((result) => {
                expect(result).toEqual({
                    id: "id",
                    record: {
                        passwordHashConfig: "passwordHashConfig"
                    }
                });
            });
        });
    });
});
