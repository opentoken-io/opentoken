"use strict";

describe("AccountService", () => {
    var accountService, storageFake, promiseMock;

    beforeEach(() => {
        var AccountService, config, secureHash;

        AccountService = require("../../lib/account/account-service");
        promiseMock = require("../mock/promise-mock");
        storageFake = jasmine.createSpyObj("storageFake", [
            "configure",
            "getAsync",
            "putAsync"
        ]);
        storageFake.configure.andCallFake(() => {
            return storageFake;
        });
        storageFake.getAsync.andCallFake(() => {
            return promiseMock.resolve(
                new Buffer('{"data": "thing"}', "binary")
            );
        });
        storageFake.putAsync.andCallFake(() => {
            return promiseMock.resolve(true);
        });
        config = {
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
        accountService = new AccountService(config, secureHash, storageFake);
    });
    describe(".completeAsync()", () => {
        it("puts the information successfully", (done) => {
            storageFake.getAsync.andCallFake(() => {
                return promiseMock.resolve('{"email": "some.one@example.net"}');
            });
            accountService.completeAsync("directory", {
                password: "somereallylonghashedpassword"
            }, {
                expires: new Date()
            }).then((result) => {
                expect(result).toEqual({
                    email: "some.one@example.net",
                    password: "somereallylonghashedpassword"
                });
            }).then(done, done);
        });
    });
    describe(".getAsync()", () => {
        it("gets a file", (done) => {
            accountService.getAsync("fdfasdfa").then((result) => {
                expect(result).toEqual(jasmine.any(Object));
            }).then(done, done);
        });
    });
    describe(".getDirectoryAsync()", () => {
        it("gets the directory", (done) => {
            accountService.getDirectoryAsync("accountIdUnhashed").then((result) => {
                expect(result).toBe("account/hashedContent");
            }).then(done, done);
        });
        it("gets the directory with config", (done) => {
            accountService.getDirectoryAsync("accountIdUnhashed", {
                accountDir: "some/place/"
            }).then((result) => {
                expect(result).toBe("some/place/hashedContent");
            }).then(done, done);
        });
    });
    describe(".initiateAsync()", (done) => {
        it("gets back what was put in", (done) => {
            accountService.initiateAsync("fasdfa", {
                accountId: "fasdfa",
                email: "some.one@example.net",
                mfa: "somesecretcodehere",
                salt: "someothersecretcodehere"
            }, {
                expires: new Date()
            }).then((result) => {
                expect(result).toEqual({
                    accountId: "fasdfa",
                    email: "some.one@example.net",
                    mfa: "somesecretcodehere",
                    salt: "someothersecretcodehere"
                });
            }).then(done, done);
        });
    });
});