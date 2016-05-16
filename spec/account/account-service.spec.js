"use strict";

describe("AccountService", () => {
    var create, defaultConfig, promiseMock, secureHashMock, storageMock;

    beforeEach(() => {
        promiseMock = require("../mock/promise-mock");
        secureHashMock = require("../mock/secure-hash-mock");
        storageMock = require("../mock/storage-mock");
        defaultConfig = {
            account: {
                accountDir: "account/",
                challenge: {
                    algo: "sha512",
                    saltLength: 128
                },
                idHash: {
                    algo: "sha256",
                    hashLength: 24,
                    iterations: 10000,
                    salt: "pinkFullyUnicornsDancingOnRainbows"
                },
                secureHash: {
                    algo: "sha512",
                    hashLength: 48,
                    iterations: 100000,
                    saltLength: 256
                },
                loginDir: "/login/",
                registrationDir: "registration/"
            },
            storage: {
                bucket: "some-place-wonderful"
            }
        };
        create = () => {
            return require("../../lib/account/account-service")(defaultConfig, promiseMock, secureHashMock, storageMock);
        };
    });
    describe(".completeAsync()", () => {
        it("puts the information successfully", (done) => {
            var accountService;

            accountService = create();
            accountService.getRegistrationFileAsync = jasmine.createSpy().andCallFake((directory) => {
                return promiseMock.resolve(
                    new Buffer('{"data": "thing"}', "binary")
                );
            });
            accountService.completeAsync({
                accountId: "unhashedAccountId",
                password: "somereallylonghashedpassword"
            }, {
                expires: new Date()
            }, "regId").then((result) => {
                expect(result).toEqual({
                    accountId: "unhashedAccountId"
                });
               expect(storageMock.delAsync.mostRecentCall.args[0]).toBe("registration/regId_hashed");
            }).then(done, done);
        });
    });
    describe(".deleteLoginFileAsync()", () => {
        it("deletes the login file", (done) => {
            var accountService;

            accountService = create();
            accountService.deleteLoginFileAsync("hashedAccountId", "unhashedLoginId").then(() => {
                expect(storageMock.delAsync.mostRecentCall.args[0]).toBe("account/hashedAccountId/login/unhashedLoginId_hashed");
            }).then(done, done);
        });
    });
    describe(".makeLoginKey()", () => {
        /**
         * This is an internal function so using a method
         * which can be called from outside the module to test.
         */
        it("creates a login key", (done) => {
            var accountService;

            accountService = create();
            accountService.deleteLoginFileAsync("hashedAccountId", "unhashedLoginId").then(() => {
                expect(storageMock.delAsync.mostRecentCall.args[0]).toBe("account/hashedAccountId/login/unhashedLoginId_hashed");
            }).then(done, done);
        });
    });
    describe(".getAccountFileAsync()", () => {
        it("gets an account file", (done) => {
            var accountService;

            accountService = create();
            accountService.getAccountFileAsync("unhashedAccountId").then((result) => {
                expect(result).toEqual(jasmine.any(Object));
            }).then(done, done);
        });
    });
    describe(".getRegistrationFileAsync()", () => {
        it("gets a registration file with config options", (done) => {
            var accountService;

            accountService = create();
            accountService.getRegistrationFileAsync("regIdUnhashed").then((result) => {
                expect(result).toEqual(jasmine.any(Object));
                expect(secureHashMock.secureHashEncodedUriAsync).toHaveBeenCalledWith("regIdUnhashed", {
                    algo: "sha256",
                    hashLength: 24,
                    iterations: 10000,
                    salt: "pinkFullyUnicornsDancingOnRainbows"
                });
            }).then(done, done);
        });
    });
    describe(".getLoginFileAsync()", () => {
        it("gets an account file", (done) => {
            var accountService;

            accountService = create();
            accountService.getLoginFileAsync("hashedAccountId", "unhashedLoginId").then((result) => {
                expect(result).toEqual(jasmine.any(Object));
            }).then(done, done);
        });
    });
    describe(".hashPasswordAsync()", () => {
        it("successfully hashes a password", (done) => {
            var accountService;

            accountService = create();
            accountService.hashPasswordAsync("unhashedAccountId", "passwordSalt").then((result) => {
                expect(secureHashMock.secureHashEncodedAsync).toHaveBeenCalled();
                expect(secureHashMock.createHash).toHaveBeenCalled();
            }).then(done, done);
        });

    });
    describe(".putLoginFileAsync()", () => {
        it("gets an account file", (done) => {
            var accountService;

            accountService = create();
            accountService.putLoginFileAsync({
                accountId: "unhashedAccountId",
                challengeId: "unhashedChallengeId",
                salt: "salt"
            }, "hashedAccountId", {
                expires: new Date()
            }).then((result) => {
                expect(result).toEqual(true);
            }).then(done, done);
        });
    });
    describe(".signupInitiateAsync()", () => {
        it("gets the registration id", (done) => {
            var accountService;

            accountService = create();
            accountService.signupInitiateAsync({
                email: "some.one@example.net",
                mfa: "somesecretcodehere",
                salt: "someothersecretcodehere"
            }, {
                expires: new Date()
            }, "jb-oRdCgvdImImS4v1XSTYcE").then((result) => {
                expect(result).toEqual({
                    regId: "jb-oRdCgvdImImS4v1XSTYcE"
                });
            }).then(done, done);
        });
    });
});