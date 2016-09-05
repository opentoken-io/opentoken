"use strict";

describe("accountManager", () => {
    var challengeManagerMock, factory, promiseMock, randomMock, sessionManagerMock, storageService, storageServiceFactoryMock, totpMock;

    beforeEach(() => {
        var utilMock;

        challengeManagerMock = require("../../mock/challenge-manager-mock")();
        promiseMock = require("../../mock/promise-mock")();
        randomMock = require("../../mock/random-mock")();
        storageServiceFactoryMock = require("../../mock/storage-service-factory-mock")();
        storageService = storageServiceFactoryMock.instance;
        sessionManagerMock = require("../../mock/session-manager-mock")();
        totpMock = require("../../mock/mfa/totp-mock")();
        utilMock = require("../../mock/util-mock")();
        factory = () => {
            var config;

            config = {
                account: {
                    idHash: {
                        idHash: "goes here"
                    },
                    idLength: 10,
                    lifetime: {
                        lifetime: "goes here"
                    },
                    passwordHash: {
                        algorithm: "algorithm",
                        derivedLength: "derivedLength",
                        encoding: "encoding",
                        iterations: "iterations",
                        type: "type"
                    },
                    passwordSaltLength: 20,
                    storagePrefix: "anything"
                }
            };

            return require("../../../lib/manager/account-manager")(challengeManagerMock, config, promiseMock, randomMock, sessionManagerMock, storageServiceFactoryMock, totpMock, utilMock);
        };
    });
    it("exposes known methods", () => {
        // This detects when methods are added.  When there are changes here,
        // make sure that those functions are tested.
        expect(factory()).toEqual({
            createAsync: jasmine.any(Function),
            loginAsync: jasmine.any(Function),
            loginHashConfigAsync: jasmine.any(Function),
            logoutAsync: jasmine.any(Function),
            passwordHashConfigAsync: jasmine.any(Function),
            recordAsync: jasmine.any(Function)
        });
    });
    it("configured the storage service correctly", () => {
        factory();
        expect(storageServiceFactoryMock).toHaveBeenCalledWith({
            idHash: "goes here"
        }, {
            lifetime: "goes here"
        }, "anything");
    });
    describe(".createAsync()", () => {
        it("creates an account", () => {
            var record;

            record = {
                email: "test@example.com",
                record: true
            };

            return factory().createAsync(record).then((result) => {
                expect(randomMock.idAsync).toHaveBeenCalledWith(10);
                expect(storageServiceFactoryMock.instance.putAsync).toHaveBeenCalledWith("BBBBBBBBBB", record, {
                    email: record.email
                });
                expect(result).toBe("BBBBBBBBBB");
            });
        });
    });
    describe(".loginAsync()", () => {
        beforeEach(() => {
            storageService.getAsync.andReturn(promiseMock.resolve({
                mfa: {
                    totp: {
                        key: "abcdefg"
                    }
                },
                passwordHash: "passwordHash"
            }));
            challengeManagerMock.validateAsync.andReturn(promiseMock.resolve());
        });
        it("fails if TOTP does not validate", () => {
            totpMock.verifyCurrent.andReturn(false);

            return factory().loginAsync("id", {
                challengeHash: "challengeHash",
                mfa: {
                    totp: "012345"
                }
            }).then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("MFA TOTP did not validate");
                expect(sessionManagerMock.createAsync).not.toHaveBeenCalled();
            });
        });
        it("grabs the record and confirms the challenge matches what is expected", () => {
            return factory().loginAsync("id", {
                challengeHash: "challengeHash",
                mfa: {
                    totp: "012345"
                }
            }).then(() => {
                expect(storageService.getAsync).toHaveBeenCalledWith("id");
                expect(challengeManagerMock.validateAsync).toHaveBeenCalledWith("id", "passwordHash", "challengeHash");
            });
        });
        it("verifies the incoming TOTP code", () => {
            return factory().loginAsync("id", {
                challengeHash: "challengeHash",
                mfa: {
                    totp: "012345"
                }
            }).then(() => {
                expect(totpMock.verifyCurrent).toHaveBeenCalledWith("abcdefg", "012345");
            });
        });
        it("creates and returns a session", () => {
            return factory().loginAsync("id", {
                challengeHash: "challengeHash",
                mfa: {
                    totp: "012345"
                }
            }).then((result) => {
                expect(sessionManagerMock.createAsync).toHaveBeenCalledWith("id");
                expect(result).toEqual({
                    sessionId: "createdId"
                });
            });
        });
    });
    describe(".loginHashConfigAsync()", () => {
        it("returns a configuration with a new challenge", () => {
            storageService.getAsync.andReturn(promiseMock.resolve({
                passwordHashConfig: "passwordHashConfig"
            }));

            return factory().loginHashConfigAsync("id").then((result) => {
                expect(challengeManagerMock.createAsync).toHaveBeenCalledWith("id");
                expect(result).toEqual({
                    challengeHashConfig: {
                        challengeConfig: "config for the challenge"
                    },
                    passwordHashConfig: "passwordHashConfig"
                });
            });
        });
    });
    describe(".logoutAsync()", () => {
        it("calls the session manager to destroy the session", () => {
            return factory().logoutAsync("accountId", "sessionId").then(() => {
                expect(sessionManagerMock.deleteAsync).toHaveBeenCalledWith("accountId", "sessionId");
            });
        });
    });
    describe(".passwordHashConfigAsync()", () => {
        it("creates a password hash structure", () => {
            return factory().passwordHashConfigAsync().then((passwordHash) => {
                expect(passwordHash).toEqual({
                    algorithm: "algorithm",
                    derivedLength: "derivedLength",
                    encoding: "encoding",
                    iterations: "iterations",
                    salt: "BBBBBBBBBBBBBBBBBBBB",
                    type: "type"
                });
            });
        });
    });
    describe(".recordAsync()", () => {
        it("filters the record to only return select values", () => {
            storageService.getAsync.andReturn(promiseMock.resolve({
                email: "emailAddress",
                mfa: {
                    totp: {
                        confirmed: true,
                        key: "totp key"
                    }
                },
                secret: "stuff"
            }));

            return factory().recordAsync("accountId").then((record) => {
                expect(record).toEqual({
                    accountId: "accountId",
                    record: {
                        email: "emailAddress"
                    }
                });
            });
        });
    });
});
