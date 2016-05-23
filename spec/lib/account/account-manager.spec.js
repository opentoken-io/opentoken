"use strict";

describe("AccountManager", () => {
    var accountServiceFake, create, defaultConfig;

    beforeEach(() => {
        var hotpFake, otDateMock, promiseMock, randomMock;

        accountServiceFake = jasmine.createSpyObj("accountServiceFake", [
            "completeAsync",
            "getRegistrationFileAsync",
            "signupInitiateAsync"
        ]);
        accountServiceFake.completeAsync.andCallFake((accountInfo) => {
            return promiseMock.resolve({
                accountId: accountInfo.accountId
            });
        });
        accountServiceFake.getRegistrationFileAsync.andCallFake(() => {
            return promiseMock.resolve({
                regId: "jb-oRdCgvdImImS4v1XSTYcE",
                mfaKey: "thisisasecrectcodefrommfa",
                passwordSalt: "longkey"
            });
        });
        accountServiceFake.signupInitiateAsync.andCallFake((accountInfo, options, regId) => {
            return promiseMock.resolve({
                regId
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
        defaultConfig = {
            account: {
                accountIdLength: 128,
                completeLifetime: {
                    months: 6
                },
                initiateLifetime: {
                    hours: 1
                },
                passwordSaltLength: 256,
                registrationIdLength: 128
            }
        };
        create = (config) => {
            return require("../../../lib/account/account-manager")(accountServiceFake, config || defaultConfig, hotpFake, otDateMock, promiseMock, randomMock);
        };
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
