"use strict";

describe("AccountManager", () => {
    var accountManager, otDateMock;

    beforeEach(() => {
        var AccountManager, accountServiceFake, config, hotpFake, promiseMock, randomMock;

        AccountManager = require("../../lib/account/account-manager");
        otDateMock = require("../mock/ot-date-mock");
        promiseMock = require("../mock/promise-mock");
        randomMock = require("../mock/random-mock");
        accountServiceFake = jasmine.createSpyObj("accountServiceFake", [
            "completeAsync",
            "getRegistrationFileAsync",
            "signupInitiateAsync"
        ]);
        accountServiceFake.completeAsync.andCallFake((accountInfo, options, regId) => {
            return promiseMock.resolve({
                accountId: "aeifFeight3ighrFieigheilw5lfiek"
            });
        });
        accountServiceFake.getRegistrationFileAsync.andCallFake(() => {
            return promiseMock.resolve({
                regId: "jb-oRdCgvdImImS4v1XSTYcE",
                mfaKey: "thisisasecrectcodefrommfa"
            });
        });
        accountServiceFake.signupInitiateAsync.andCallFake((accountInfo, options) => {
            return promiseMock.resolve({
                regId: "jb-oRdCgvdImImS4v1XSTYcE"
            });
        });
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
        accountManager = require("../../lib/account/account-manager")(accountServiceFake, config, hotpFake, otDateMock, randomMock, promiseMock);
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
                    accountId: "aeifFeight3ighrFieigheilw5lfiek",
                });
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