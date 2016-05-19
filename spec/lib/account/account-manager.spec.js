"use strict";

describe("AccountManager", () => {
    var accountServiceFake, create, defaultConfig, otDateMock, promiseMock;

    beforeEach(() => {
        var hotpFake, randomMock, secureHash;

        accountServiceFake = jasmine.createSpyObj("accountServiceFake", [
            "completeAsync",
            "deleteLoginFileAsync",
            "getAccountFileAsync",
            "getLoginFileAsync",
            "getRegistrationFileAsync",
            "hashPasswordAsync",
            "putLoginFileAsync",
            "signupInitiateAsync"
        ]);
        accountServiceFake.completeAsync.andCallFake((accountInfo) => {
            return promiseMock.resolve({
                accountId: accountInfo. accountId
            });
        });
        accountServiceFake.deleteLoginFileAsync.andCallFake((accountId) => {
            if (accountId.match("noDelete")) {
                return promiseMock.reject();
            }

            return promiseMock.resolve(true);
        });
        accountServiceFake.hashPasswordAsync.andCallFake((data) => {
            return promiseMock.resolve(data);
        });
        accountServiceFake.getLoginFileAsync.andCallFake((accountId, loginId) => {
            var suffix;

            suffix = "";

            if (accountId.match("noMatch")) {
                suffix = "_noMatch";
            }

            return promiseMock.resolve({
                challengeId: "unhashedChallengeId",
                salt: "unhashedLoginSalt",
                accountId: accountId,
                secureHash: "accountPassword" + suffix
            });
        });
        accountServiceFake.getAccountFileAsync.andCallFake((accountId) => {
            var suffix;

            suffix = "";

            if (accountId.match("noMatch")) {
                suffix = "_noMatch";
            }

            return promiseMock.resolve({
                email: "some.one@example.net",
                mfaKey: "thisisasecrectcodefrommfa",
                password: "accountPassword" + suffix,
                passwordSalt: "longkey",
                pbkdf2: {
                    algo: "sha512",
                    bytes: 48,
                    derivation: "pbkdf2",
                    iterations: 100000
                }
            });
        });
        accountServiceFake.getRegistrationFileAsync.andCallFake(() => {
            return promiseMock.resolve({
                regId: "jb-oRdCgvdImImS4v1XSTYcE",
                mfaKey: "thisisasecrectcodefrommfa",
                passwordSalt: "longkey"
            });
        });
        accountServiceFake.putLoginFileAsync.andCallFake(() => {
            return promiseMock.resolve(true);
        });
        accountServiceFake.signupInitiateAsync.andCallFake((accountInfo, options, regId) => {
            return promiseMock.resolve({
                regId: regId
            });
        });
        hotpFake = jasmine.createSpyObj("hotpFake", [
            "generateSecretAsync",
            "verifyToken"
        ]);
        hotpFake.generateSecretAsync.andCallFake(() => {
            return promiseMock.resolve("thisisasecrectcodefrommfa");
        });
        hotpFake.verifyToken.andCallFake((key, token) => {
            return token !== "987654";
        });
        otDateMock = require("../../mock/ot-date-mock");
        promiseMock = require("../../mock/promise-mock");
        randomMock = require("../../mock/random-mock");
        secureHash = require("../../mock/secure-hash-mock");
        defaultConfig = {
            account: {
                accountIdLength: 128,
                completeLifetime: {
                    months: 6
                },
                initiateLifetime: {
                    hours: 1
                },
                secureHash: {
                    algo: "sha512",
                    hashLength: 48,
                    iterations: 100000,
                    saltLength: 256
                },
                passwordSaltLength: 256,
                registrationIdLength: 128,
            },
            login: {
                loginIdLength: 24,
                loginLifetime: {
                    minutes: 15
                },
                challenge: {
                    algo: "sha512",
                    saltLength: 128
                }
            }
        };
        create = () => {
            return require("../../../lib/account/account-manager")(accountServiceFake, defaultConfig, hotpFake, otDateMock, promiseMock, randomMock, secureHash);
        };
    });
    describe(".keyExpiration()", () => {
        /**
         * This is an internal function so using a method
         * which can be called from outside the module to test.
         */
        it("successfully creates a key", (done) => {
            var accountManager;

            accountManager = create();
            accountManager.loginInitiationAsync("hashedAccountId", {
                accountId: "unhashedAccountId"
            }).then((result) => {
                var dateArg;

                dateArg = accountServiceFake.putLoginFileAsync.mostRecentCall.args;
                expect(dateArg[2]).toEqual({
                    expires: jasmine.any(Object)
                });
            }).then(done, done);
        });
    });
    describe(".loginCompleteAsync()", () => {
        it("returns the challenge and salt needed to log in", (done) => {
            var accountManager;

            accountManager = create();
            accountManager.loginCompleteAsync("hashedAccountId", "unhashedLoginId" , {
                secureHash: "accountPassword",
                currentMfa: "123456"
            }).then((result) => {
                expect(result).toBe(true);
            }).then(done, done);
        });
        it("does not have matching hashes", (done) => {
            var accountManager;

            accountManager = create();
            jasmine.testPromiseFailure(accountManager.loginCompleteAsync("hashedAccountId_noMatch", "unhashedLoginId" , {
                secureHash: "accountPassword_noMatch",
                currentMfa: "123456"
            }), "Password hashes do not match", done);
        });
        it("does not have a valid MFA token", (done) => {
            var accountManager;

            accountManager = create();
            jasmine.testPromiseFailure(accountManager.loginCompleteAsync("hashedAccountId", "unhashedLoginId" , {
                secureHash: "accountPassword",
                currentMfa: "987654"
            }), "Current MFA Token did not validate", done);
        });
        it("does not delete properly", (done) => {
            var accountManager;

            accountManager = create();
            jasmine.testPromiseFailure(accountManager.loginCompleteAsync("hashedAccountId_noDelete", "unhashedLoginId" , {
                secureHash: "accountPassword",
                currentMfa: "123456"
            }), done);
        });
    });
    describe(".loginInitiationAsync()", () => {
        it("successfully creates a login", (done) => {
            var accountManager;

            accountManager = create();
            accountManager.loginInitiationAsync("hashedAccountId", {
                accountId: "unhashedAccountId"
            }).then((result) => {
                expect(result).toEqual({
                    pbkdf2: jasmine.any(Object),
                    challenge: {
                        salt: jasmine.any(String),
                        algo: "sha512"
                    },
                    encoding: "base64",
                    mfa: [
                        "hotp"
                    ],
                    passwordSalt: "longkey"
                });
                expect(result.challenge.salt.length).toBe(128);
            }).then(done, done);
        });
        it("throws from not having matching hashes", (done) => {
            var accountManager;

            accountManager = create();
            jasmine.testPromiseFailure(accountManager.loginInitiationAsync("hashedAccountId", {
                accountId: "unhashAccount_noMatch"
            }), "Account hashes do not match", done);
        });
    });
    describe(".signupInitiationAsync()", () => {
        it("gets the registration id back using config options", (done) => {
            var accountManager;

            accountManager = create();
            accountManager.signupInitiationAsync({
                email: "some.one@example.net"
            }).then((result) => {
                var args;
                expect(result.regId.length).toBe(128);
                args = accountServiceFake.signupInitiateAsync.mostRecentCall.args;
                expect(args[0].passwordSalt.length).toBe(256);
                expect(args[2].length).toBe(128);
            }).then(done, done);
        });
        it("fails without registrationIdLength set", () => {
            var accountManager;

            delete defaultConfig.account.registrationIdLength;
            accountManager = create();
            expect(() => {
                accountManager.signupInitiationAsync({
                    email: "some.one@example.net"
                });
            }).toThrow("must start with number, buffer, array or string");
        });
        it("fails without passwordSaltLength set", () => {
            var accountManager;

            delete defaultConfig.account.passwordSaltLength;
            accountManager = create();
            expect(() => {
                accountManager.signupInitiationAsync({
                    email: "some.one@example.net"
                });
            }).toThrow("must start with number, buffer, array or string");
        });
    });
    describe(".signupConfirmAsync()", () => {
        it("returns the information to complete registration", (done) => {
            var accountManager;

            accountManager = create();
            accountManager.signupConfirmAsync("aeifFeight3ighrFieigheilw5lfiek").then((result) => {
                expect(result).toEqual({
                    mfaKey: "thisisasecrectcodefrommfa",
                    pbkdf2: jasmine.any(Object),
                    encoding: "base64",
                    mfa: [
                        "hotp"
                    ],
                    passwordSalt: "longkey"
                });
            }).then(done, done);
        });
    });
    describe(".signupCompleteAsync()", () => {
        it("successfully completes using config options", (done) => {
            var accountManager;

            accountManager = create();
            accountManager.signupCompleteAsync({
                regId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123456",
                previousMfa: "098454",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }).then((result) => {
                expect(result.accountId.length).toBe(128);
            }).then(done, done);
        });
        it("has an expired previous token", (done) => {
            var accountManager;

            accountManager = create();
            jasmine.testPromiseFailure(accountManager.signupCompleteAsync({
                regId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123456",
                previousMfa: "987654",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }), "Previous MFA Token did not validate", done);
        });
        it("has an expired current token", (done) => {
            var accountManager;

            accountManager = create();
            jasmine.testPromiseFailure(accountManager.signupCompleteAsync({
                regId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "987654",
                previousMfa: "123456",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }), "Current MFA Token did not validate", done);
        });
        it("fails without accountIdLength set", (done) => {
            var accountManager;

            delete defaultConfig.account.accountIdLength;
            accountManager = create();
            jasmine.testPromiseFailure(accountManager.signupCompleteAsync({
                regId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123456",
                previousMfa: "098454",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }), "TypeError: must start with number, buffer, array or string", done);
        });
    });
});
