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
    describe(".destroyAsync()", () => {
        it("deletes from the storage service", () => {
            return manager.destroyAsync("accountId", "code").then(() => {
                expect(storageService.delAsync).toHaveBeenCalledWith([
                    "accountId",
                    "code"
                ]);
            });
        });
    });
});
