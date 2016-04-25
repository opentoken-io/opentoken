"use strict";

describe("AccountService", () => {
    var accountService;

    beforeEach(() => {
        var AccountService, config, password, promiseMock;

        AccountService = require("../../lib/account/account-service");
        promiseMock = require("../mock/promise-mock");
        class StorageFake {
            constructor() {
                this.configure = jasmine.createSpy("storage.configure");
                this.configure.andCallFake(() => {
                    return this;
                });
                this.getAsync = jasmine.createSpy("getAsync");
                this.getAsync.andCallFake((params) => {
                    return promiseMock.resolve(
                        new Buffer('{"data": "thing"}', "binary")
                    );
                });
                this.putAsync = jasmine.createSpy("putAsync");
                this.putAsync.andCallFake((params) => {
                    return promiseMock.resolve(() => {
                        return true;
                    });
                });
            }
        }
        config = {
            storage: {
                bucket: "some-place-wonderful"
            }
        };
        password = jasmine.createSpyObj("password", [
            "hashContent"
        ]);
        password.hashContent.andCallFake(() => {
            return "hashedContent";
        });
        accountService = new AccountService(config, password, new StorageFake);
    });
    describe(".complete()", () => {
        it("puts the information successfully", (done) => {
            accountService.complete("directory", {
                email: "some.one@example.net",
            }, {
                password: "somereallylonghashedpassword"
            }, {
                expires: new Date()
            }).then((result) => {
                expect(result).toEqual(true);
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