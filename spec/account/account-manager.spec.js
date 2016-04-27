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
            "getAsync",
            "getDirectory",
            "initiateAsync"
        ]);
        accountServiceFake.completeAsync.andCallFake((directory, accountInfo) => {
            return promiseMock.resolve(accountInfo);
        });
        accountServiceFake.getAsync.andCallFake(() => {
            return promiseMock.resolve({
                mfaKey: "339r93939303093"
            });
        });
        accountServiceFake.getDirectory.andCallFake(() => {
            return promiseMock.resolve("/account/hashedAccountId");
        });
        accountServiceFake.initiateAsync.andCallFake((accountId, accountInfo, options) => {
            return promiseMock.resolve({
                accountId: accountInfo.accountId,
                email: accountInfo.email,
                mfaKey: accountInfo.mfaKey,
                salt: accountInfo.salt
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
        accountManager = new AccountManager(accountServiceFake, config, hotpFake, otDateMock, randomMock, promiseMock);
    });
    describe(".initiate()", () => {
        it("gets an object back from service", (done) => {
            accountManager.initiateAsync({
                email: "some.one@example.net"
            }).then((result) => {
                expect(result).toEqual({
                    accountId: jasmine.any(Buffer),
                    email: "some.one@example.net",
                    mfaKey: "thisisasecrectcodefrommfa",
                    salt: jasmine.any(Buffer)
                });
                expect(result.accountId.length).toBe(24);
                expect(result.salt.length).toBe(128);

            }).then(done, done);
        });
    });
    describe(".completeAsync()", () => {
        var expectError, fail;

        // TODO: Create custom matchers
        function expectError (done, contains) {
            // Generate a function that asserts the result is an error
            // and contains some text in the message.
            return (err) => {
                expect(err).toEqual(jasmine.any(Error));
                expect(err.toString()).toContain(contains);
                done();
            };
        }

        function fail (done) {
            // Generate a function that always fails
            return () => {
                // Unconditionally cause a failure
                expect(true).toBe(false);
                done();
            };
        }

        it("successfully completes", (done) => {
            accountManager.completeAsync({
                accountId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123456",
                previousMfa: "098454",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }).then((result) => {
                expect(result).toEqual({accountId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123456",
                previousMfa: "098454",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"});
            }).then(done, done);
        });
        it("has an expired previous token", (done) => {
            accountManager.completeAsync({
                accountId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123456",
                previousMfa: "987654",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }).then(fail(done), expectError(done, "Previous MFA Token did not validate"));
        });
        it("has an expired current token", (done) => {
            accountManager.completeAsync({
                accountId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "987654",
                previousMfa: "123456",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }).then(fail(done), expectError(done, "Current MFA Token did not validate"));
        });
        it("does not have previous mfa information", (done) => {
            /**
             * Kind of forcing the test of the previous not validating
             * when missing the hotp previous information,
             * but since we mock up other calls this represents what we
             * should get back when we don't have the previous information
             * as it would try to verify the previous as current.
             */
            accountManager.config.hotp = {};
            accountManager.completeAsync({
                accountId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123457",
                previousMfa: "987654",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }).then(fail(done), expectError(done, "Previous MFA Token did not validate"));
        });
    });
});