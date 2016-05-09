"use strict";

describe("AccountService", () => {
    var accountService, create, defaultConfig, promiseMock, secureHash, storageMock;

    beforeEach(() => {
        promiseMock = require("../mock/promise-mock");
        storageMock = require("../mock/storage-mock");
        defaultConfig = {
            account: {
                accountDir: "account/",
                idHash: {
                    algo: "sha256",
                    hashLength: 24,
                    iterations: 10000,
                    salt: "pinkFullyUnicornsDancingOnRainbows"
                },
                loginDir: "/login/",
                registrationDir: "registration/"
            },
            storage: {
                bucket: "some-place-wonderful"
            }
        };
        secureHash = jasmine.createSpyObj("secureHash", [
            "hashAsync"
        ]);
        secureHash.hashAsync.andCallFake(() => {
            return promiseMock.resolve("hashedContent");
        });
        create = () => {
            return accountService = require("../../lib/account/account-service")(defaultConfig, promiseMock, secureHash, storageMock);
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
            }, "somethinghere").then((result) => {
                expect(result).toEqual({
                    accountId: "unhashedAccountId"
                });
                expect(storageMock.delAsync).toHaveBeenCalledWith("registration/hashedContent");
            }).then(done, done);
        });
    });
    describe(".deleteLoginFileAsync()", () => {
        it("does something", (done) => {
            var accountService;

            accountService = create();
            accountService.deleteLoginFileAsync("hashedAccountId", "unhashedLoginId").then(() => {
                expect(storageMock.delAsync).toHaveBeenCalledWith("account/hashedAccountId/login/hashedContent");
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
                expect(storageMock.delAsync).toHaveBeenCalledWith("account/hashedAccountId/login/hashedContent");
            }).then(done, done);
        });
        it("creates a login key", (done) => {
            var accountService;

            delete defaultConfig.account.loginDir;
            accountService = create();
            jasmine.testPromiseFailure(accountService.deleteLoginFileAsync("hashedAccountId", "unhashedLoginId"), " Missing configuration options to create login key", done);
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
                expect(secureHash.hashAsync).toHaveBeenCalledWith("regIdUnhashed", {
                    algo: "sha256",
                    hashLength: 24,
                    iterations: 10000,
                    salt: "pinkFullyUnicornsDancingOnRainbows"
                });
            }).then(done, done);
        });
        it ("gets a registration file without config options", (done) => {
            var accountService;

            defaultConfig = {};
            accountService = create();
            accountService.getRegistrationFileAsync("regIdUnhashed").then((result) => {
                expect(result).toEqual({
                    data: "thing"
                });
                expect(secureHash.hashAsync).toHaveBeenCalledWith("regIdUnhashed", undefined);
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