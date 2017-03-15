"use strict";

describe("tokenManager", () => {
    var manager, storageService, storageServiceFactoryMock;

    beforeEach(() => {
        var configMock, promiseMock, randomMock;

        configMock = {
            account: {
                idHash: "account ID hash"
            },
            token: {
                idHash: "token ID hash",
                idLength: 4,
                lifetime: {
                    lifetime: true
                },
                storagePrefix: "token storage prefix"
            }
        };
        promiseMock = require("../../mock/promise-mock")();
        randomMock = require("../../mock/random-mock")();
        storageServiceFactoryMock = require("../../mock/storage-service-factory-mock")();
        manager = require("../../../lib/manager/token-manager")(configMock, promiseMock, randomMock, storageServiceFactoryMock);
        storageService = storageServiceFactoryMock.instance;
        storageService.getAsync.and.callFake(() => {
            return promiseMock.resolve("token record");
        });
    });
    it("exports known methods", () => {
        expect(Object.keys(manager).sort()).toEqual([
            "createAsync",
            "deleteAsync",
            "getRecordAsync"
        ]);
    });
    it("created a storage service instance", () => {
        expect(storageServiceFactoryMock).toHaveBeenCalledWith([
            "account ID hash",
            "token ID hash"
        ], {
            lifetime: true
        }, "token storage prefix");
    });
    describe(".createAsync()", () => {
        it("makes public tokens", () => {
            return manager.createAsync("accountId", "data", {
                public: true
            }).then((record) => {
                expect(storageService.putAsync).toHaveBeenCalledWith([
                    "accountId",
                    "BBBB"
                ], {
                    contentType: "application/octet-stream",
                    data: "data",
                    public: true
                });
                expect(record).toEqual("BBBB");
            });
        });
        it("allows you to override the content type", () => {
            return manager.createAsync("accountId", "data", {
                contentType: "text/plain"
            }).then((record) => {
                expect(storageService.putAsync).toHaveBeenCalledWith([
                    "accountId",
                    "BBBB"
                ], {
                    contentType: "text/plain",
                    data: "data"
                });
                expect(record).toEqual("BBBB");
            });
        });
        it("calls the storage service", () => {
            return manager.createAsync("accountId", "data").then((record) => {
                expect(storageService.putAsync).toHaveBeenCalledWith([
                    "accountId",
                    "BBBB"
                ], {
                    contentType: "application/octet-stream",
                    data: "data"
                });
                expect(record).toEqual("BBBB");
            });
        });
    });
    describe(".deleteAsync()", () => {
        it("calls the storage service", () => {
            return manager.deleteAsync("accountId", "tokenId").then(() => {
                expect(storageService.deleteAsync).toHaveBeenCalledWith([
                    "accountId",
                    "tokenId"
                ]);
            });
        });
    });
    describe(".getRecordAsync()", () => {
        it("calls the storage service", () => {
            return manager.getRecordAsync("accountId", "tokenId").then((record) => {
                expect(storageService.getAsync).toHaveBeenCalledWith([
                    "accountId",
                    "tokenId"
                ]);
                expect(record).toEqual("token record");
            });
        });
    });
});
