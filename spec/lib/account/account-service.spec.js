"use strict";

describe("AccountService", () => {
    var accountService, promiseMock, secureHash, storageMock;

    beforeEach(() => {
        var config;

        promiseMock = require("../../mock/promise-mock");
        storageMock = require("../../mock/storage-mock");
        config = {
            account: {
                accountDir: "account/",
                registrationDir: "registration/",
                idHash: {
                    algorithm: "sha256",
                    hashLength: 24,
                    iterations: 10000,
                    salt: "pinkFullyUnicornsDancingOnRainbows"
                }
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
        accountService = require("../../../lib/account/account-service")(config, secureHash, storageMock);
    });
    describe(".completeAsync()", () => {
        it("puts the information successfully", (done) => {
            accountService.getRegistrationFileAsync = jasmine.createSpy().andCallFake(() => {
                return promiseMock.resolve(
                    new Buffer("{\"data\": \"thing\"}", "binary")
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
    describe(".getRegistrationFileAsync()", () => {
        it("gets a registration file with config options", (done) => {
            accountService.getRegistrationFileAsync("regIdUnhashed").then((result) => {
                expect(result).toEqual(jasmine.any(Object));
                expect(secureHash.hashAsync).toHaveBeenCalledWith("regIdUnhashed", {
                    algorithm: "sha256",
                    hashLength: 24,
                    iterations: 10000,
                    salt: "pinkFullyUnicornsDancingOnRainbows"
                });
            }).then(done, done);
        });
        it("gets a registration file without config options", (done) => {
            var accountServiceLocal;

            accountServiceLocal = require("../../../lib/account/account-service")({}, secureHash, storageMock);
            accountServiceLocal.getRegistrationFileAsync("regIdUnhashed").then((result) => {
                var args;

                expect(result).toEqual({
                    data: "thing"
                });
                expect(secureHash.hashAsync).toHaveBeenCalled();
                args = secureHash.hashAsync.mostRecentCall.args;
                expect(args[0]).toBe("regIdUnhashed");
                expect(typeof args[1]).toBe("undefined");
            }).then(done, done);
        });
    });
    describe(".signupInitiateAsync()", () => {
        it("gets the registration id", (done) => {
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
