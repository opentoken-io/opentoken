"use strict";

describe("AccountService", () => {
    var accountService;

    beforeEach(() => {
        var AccountService, config, password, promiseMock, storageFake;

        AccountService = require("../../lib/account/account-service");
        promiseMock = require("../mock/promise-mock");
        storageFake = jasmine.createSpyObj("storageFake", [
            "configure",
            "getAsync",
            "putAsync"
        ]);
        storageFake.configure = jasmine.createSpy("storageFake.configure").andCallFake(() => {
            return storageFake;
        });
        storageFake.getAsync = jasmine.createSpy("storageFake.getAsync").andCallFake(() => {
            return promiseMock.resolve(
                new Buffer('{"data": "thing"}', "binary")
            );
        });
        storageFake.putAsync = jasmine.createSpy("storageFake.putAsync").andCallFake(() => {
            return promiseMock.resolve(true);
        });
        config = {
            storage: {
                bucket: "some-place-wonderful"
            }
        };
        password = jasmine.createSpyObj("password", [
            "hashContent"
        ]);
        password.hashContent = jasmine.createSpy("password.hashContent").andCallFake(() => {
            return "hashedContent";
        });
        accountService = new AccountService(config, password, storageFake);
    });
    describe(".complete()", () => {
        it("puts the information successfully", (done) => {
            accountService.accountFile = {
                "email": "some.one@example.net"
            };
            accountService.complete("directory", {
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
    describe(".get()", () => {
        it("gets a file", (done) => {
            accountService.get("fdfasdfa").then((result) => {
                expect(result).toEqual(jasmine.any(Object));
            }).then(done, done);
        });
    });
    describe(".getDirectory()", () => {
        it("gets the directory", () => {
            expect(accountService.getDirectory("accountIdUnhashed")).toEqual("account/hashedContent");
        });
    });
    describe(".initiate()", (done) => {
        it("gets back what was put in", (done) => {
            accountService.initiate("fasdfa", {
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