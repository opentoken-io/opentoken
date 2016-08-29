"use strict";

describe("accessCodeManager", () => {
    var manager, promiseMock, storageService, storageServiceFactoryMock;

    beforeEach(() => {
        var fakeConfig, randomMock;

        fakeConfig = {
            accessCode: {
                codeHash: {
                    what: "access code hash"
                },
                codeLength: 12,
                lifetime: {
                    what: "access code lifetime"
                },
                secretLength: 14,
                storagePrefix: "access code storage prefix"
            },
            account: {
                idHash: {
                    what: "account id hash"
                }
            }
        };
        promiseMock = require("../mock/promise-mock")();
        randomMock = require("../mock/random-mock")();
        storageServiceFactoryMock = require("../mock/storage-service-factory-mock")();
        storageService = storageServiceFactoryMock.instance;
        manager = require("../../lib/access-code-manager")(fakeConfig, promiseMock, randomMock, storageServiceFactoryMock);
    });
    it("creates the right storage service", () => {
        expect(storageServiceFactoryMock).toHaveBeenCalledWith([
            {
                what: "account id hash"
            }, {
                what: "access code hash"
            }
        ], {
            what: "access code lifetime"
        }, "access code storage prefix");
    });
    describe(".createAsync()", () => {
        describe("successful saving", () => {
            beforeEach(() => {
                storageService.putAsync.andReturn(promiseMock.resolve({
                    expires: "some expiration date"
                }));
            });
            it("saves the record", () => {
                return manager.createAsync("accountId", {}).then(() => {
                    expect(storageService.putAsync).toHaveBeenCalledWith([
                        "accountId",
                        "BBBBBBBBBBBB"
                    ], {
                        secret: "BBBBBBBBBBBBBB"
                    }, {});
                });
            });
            it("returns information about the generated code", () => {
                return manager.createAsync("accountId", {}).then((result) => {
                    expect(result).toEqual({
                        code: "BBBBBBBBBBBB",
                        expires: "some expiration date",
                        secret: "BBBBBBBBBBBBBB"
                    });
                });
            });
            it("adds a description", () => {
                return manager.createAsync("accountId", {
                    description: "some description"
                }).then(() => {
                    expect(storageService.putAsync).toHaveBeenCalledWith([
                        "accountId",
                        "BBBBBBBBBBBB"
                    ], {
                        secret: "BBBBBBBBBBBBBB"
                    }, {
                        description: "some description"
                    });
                });
            });
        });
        describe("failed saving", () => {
            it("rejects the promise", () => {
                storageService.putAsync.andReturn(promiseMock.reject("x"));

                return manager.createAsync().then(jasmine.fail, () => {
                    return;
                });
            });
        });
    });
    describe(".deleteAsync()", () => {
        it("deletes from the storage service", () => {
            return manager.deleteAsync("accountId", "code").then(() => {
                expect(storageService.deleteAsync).toHaveBeenCalledWith([
                    "accountId",
                    "code"
                ]);
            });
        });
        it("requires an account ID", () => {
            return manager.deleteAsync("", "code").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Account ID must not be empty");
            });
        });
        it("requires a code", () => {
            return manager.deleteAsync("accountId", "").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Code must not be empty");
            });
        });
    });
    describe(".getAsync()", () => {
        it("gets from the storage service", () => {
            storageService.getAsync.andReturn(promiseMock.resolve("record data"));

            return manager.getAsync("accountId", "code").then((result) => {
                expect(storageService.getAsync).toHaveBeenCalledWith([
                    "accountId",
                    "code"
                ]);
                expect(result).toEqual("record data");
            });
        });
        it("requires an account ID", () => {
            return manager.deleteAsync("", "code").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Account ID must not be empty");
            });
        });
        it("requires a code", () => {
            return manager.deleteAsync("accountId", "").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Code must not be empty");
            });
        });
    });
});
