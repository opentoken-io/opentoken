"use strict";

describe("AccountManager", () => {
    var accountManager, otDateMock;

    beforeEach(() => {
        var AccountManager, config, promiseMock, randomMock;

        AccountManager = require("../lib/account/account-manager");
        otDateMock = require("./mock/ot-date-mock");
        promiseMock = require("./mock/promise-mock");
        randomMock = require("./mock/random-mock");
        class AccountServiceFake {
            constructor() {
                this.initiate = jasmine.createSpy("initiate");
                this.initiate.andCallFake((accountId, accountInfo, options) => {
                    return promiseMock.resolve({
                        accountId: accountInfo.accountId,
                        email: accountInfo.email,
                        mfa: accountInfo.mfa,
                        salt: accountInfo.salt
                    });
                });
                this.complete = jasmine.createSpy("complete");
                this.complete.andCallFake(() => {
                    return promiseMock.resolve(true);
                });
                this.get = jasmine.createSpy("get");
                this.get.andCallFake(() => {
                    return promiseMock.resolve({
                        mfa: "339r93939303093"
                    });
                });
            }
        }
        class HotpFake {
            constructor() {
                this.generateSecret = jasmine.createSpy("generateSecret");
                this.generateSecret.andCallFake(() => {
                    return promiseMock.resolve("thisisasecrectcodefrommfa");
                });
                // This is a sync call
                this.verifyToken = jasmine.createSpy();
                this.verifyToken.andCallFake((key, token, opts) => {
                    if (token === "987654") {
                        return false;
                    }

                    return true;
                });
            }
        }
        config = {
            account: {
                completeLifetime: {
                    months: 6
                },
                initiateLifetime: {
                    hours: 1
                }
            },
            hotp: {
                previous: {
                    afterDrift: 1,
                    beforeDrift: 1,
                    drift: 2
                }
            }
        };
        accountManager = new AccountManager(new AccountServiceFake, config, new HotpFake, otDateMock, randomMock, promiseMock);
    });
    describe(".initiate()", () => {
        it("gets an object back from service", (done) => {
            accountManager.initiate({
                email: "some.one@example.net"
            }).then((result) => {
                expect(result).toEqual({
                    accountId: jasmine.any(Buffer),
                    email: "some.one@example.net",
                    mfa: "thisisasecrectcodefrommfa",
                    salt: jasmine.any(Buffer)
                });
                expect(result.accountId.length).toBe(24);
                expect(result.salt.length).toBe(128);

            }).then(done, done);
        });
    });
    describe(".complete()", () => {
        var expectError, fail;

        beforeEach(() => {
            expectError = (done, contains) => {
                // Generate a function that asserts the result is an error
                // and contains some text in the message.
                return (err) => {
                    expect(err).toEqual(jasmine.any(Error));
                    expect(err.toString()).toContain(contains);
                    done();
                };
            };
            fail = (done) => {
                // Generate a function that always fails
                return () => {
                    // Unconditionally cause a failure
                    expect(true).toBe(false);
                    done();
                };
            };
        });
        it("successfully completes", (done) => {
            accountManager.complete({
                accountId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123456",
                previousMfa: "098454",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }).then((result) => {
                expect(result).toBe(true);
            }).then(done, done);
        });
        it("has an expired previous token", (done) => {
            accountManager.complete({
                accountId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123456",
                previousMfa: "987654",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }).then(fail(done), expectError(done, "Previous MFA Token did not validate"));
        });
        it("has an expired current token", (done) => {
            accountManager.complete({
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
            accountManager.complete({
                accountId: "aeifFeight3ighrFieigheilw5lfiek",
                currentMfa: "123457",
                previousMfa: "987654",
                password: "3439gajs933098fj3jfj90aj09fj9390a9023"
            }).then(fail(done), expectError(done, "Previous MFA Token did not validate"));
        });
    });
});