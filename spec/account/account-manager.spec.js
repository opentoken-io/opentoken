"use strict";

describe("AccountManager", () => {
    var accountManager, accountServiceFake, otDateMock, hotpFake, promiseMock, randomMock;

    beforeEach(() => {
        var config;

        accountServiceFake = jasmine.createSpyObj("accountServiceFake", [
            "completeAsync",
            "getRegistrationFileAsync",
            "signupInitiateAsync"
        ]);
        accountServiceFake.completeAsync.andCallFake((accountInfo, options, regId) => {
            return promiseMock.resolve({
                accountId: accountInfo. accountId
            });
        });
        accountServiceFake.getRegistrationFileAsync.andCallFake(() => {
            return promiseMock.resolve({
                regId: "jb-oRdCgvdImImS4v1XSTYcE",
                mfaKey: "thisisasecrectcodefrommfa",
                passwordSalt: "longkey"
            });
        });
        accountServiceFake.signupInitiateAsync.andCallFake((accountInfo, options) => {
            return promiseMock.resolve({
                regId: accountInfo.regId
            });
        });
        config = {
            account: {
                completeLifetime: {
                    months: 6
                },
                initiateLifetime: {
                    hours: 1
                }
            }
        };
        hotpFake = jasmine.createSpyObj("hotpFake", [
            "generateSecretAsync",
            "verifyToken"
        ]);
        hotpFake.generateSecretAsync.andCallFake(() => {
            return promiseMock.resolve("thisisasecrectcodefrommfa");
        });
        hotpFake.verifyToken.andCallFake((key, token, opts) => {
            return token !== "987654";
        });
        otDateMock = require("../mock/ot-date-mock");
        promiseMock = require("../mock/promise-mock");
        randomMock = require("../mock/random-mock");
        accountManager = require("../../lib/account/account-manager")(accountServiceFake, config, hotpFake, otDateMock, promiseMock, randomMock);
    });
    describe(".signupInitiationAsync()", () => {
        it("gets the registration id back", (done) => {
            accountManager.signupInitiationAsync({
                email: "some.one@example.net"
            }).then((result) => {
                expect(result).toEqual({
                    regId: jasmine.any(String)
                });
                expect(result.regId.length).toBe(24);
            }).then(done, done);
        });
        it("gets the registration id back using config options", (done) => {
            var accountManagerLocal;

            accountManagerLocal = require("../../lib/account/account-manager")(accountServiceFake, {
                account: {
                    registrationIdLength: 128,
                    initiateLifetime: {
                        hours: 1
                    },
                    passwordSaltLength: 256
                }
            }, hotpFake, otDateMock, promiseMock, randomMock);
            accountManagerLocal.signupInitiationAsync({
                email: "some.one@example.net"
            }).then((result) => {
                var args;
                expect(result.regId.length).toBe(128);
                args = accountServiceFake.signupInitiateAsync.mostRecentCall.args;
                expect(args[0].regId.length).toBe(128);
                expect(args[0].passwordSalt.length).toBe(256);
            }).then(done, done);
        });
    });
    describe(".signupConfirmAsync()", () => {
        it("returns the information to complete registration", (done) => {
            accountManager.signupConfirmAsync("aeifFeight3ighrFieigheilw5lfiek").then((result) => {
                expect(result).toEqual({
                    mfaKey: "thisisasecrectcodefrommfa",
                    passwordSalt: "longkey"
                });
            }).then(done, done);
        });
    });
    describe(".signupCompleteAsync()", () => {
        it("successfully completes", (done) => {
            accountManager.signupCompleteAsync({
                regId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123456",
                previousMfa: "098454",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }).then((result) => {
                expect(result).toEqual({
                    accountId: jasmine.any(String),
                });
                expect(result.accountId.length).toBe(24);
            }).then(done, done);
        });
        it("successfully completes using config options", (done) => {
            var accountManagerLocal;

            accountManagerLocal = require("../../lib/account/account-manager")(accountServiceFake, {
                account: {
                    accountIdLength: 128,
                    "completeLifetime": {
                        "months": 6
                    },
                }
            }, hotpFake, otDateMock, promiseMock, randomMock);
            accountManagerLocal.signupCompleteAsync({
                regId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123456",
                previousMfa: "098454",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }).then((result) => {
                expect(result.accountId.length).toBe(128);
            }).then(done, done);
        });
        it("has an expired previous token", (done) => {
            jasmine.testPromiseFailure(accountManager.signupCompleteAsync({
                regId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123456",
                previousMfa: "987654",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }), "Previous MFA Token did not validate", done);
        });
        it("has an expired current token", (done) => {
            jasmine.testPromiseFailure(accountManager.signupCompleteAsync({
                regId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "987654",
                previousMfa: "123456",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }), "Current MFA Token did not validate", done);
        });
    });
});