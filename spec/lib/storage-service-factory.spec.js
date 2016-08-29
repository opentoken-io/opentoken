"use strict";

describe("storageServiceFactory", () => {
    var hashMock, OtDateMock, promiseMock, recordMock, storageMock, storageServiceFactory;

    beforeEach(() => {
        var util;

        OtDateMock = require("../mock/ot-date-mock")();
        promiseMock = require("../mock/promise-mock")();
        recordMock = require("../mock/record-mock")();
        hashMock = require("../mock/hash-mock")();
        util = require("../../lib/util")();
        hashMock.deriveAsync.andCallFake((input, hashConfig) => {
            return promiseMock.resolve(`${hashConfig.name}(${input})`);
        });
        storageMock = require("../mock/storage-mock")();
        storageServiceFactory = require("../../lib/storage-service-factory")(hashMock, OtDateMock, promiseMock, recordMock, storageMock, util);
    });
    it("returns a function (hopefully a factory)", () => {
        expect(storageServiceFactory).toEqual(jasmine.any(Function));
    });
    describe("instance with a single hashConfig", () => {
        var hashConfig, lifetime, storagePrefix, storageService;

        beforeEach(() => {
            hashConfig = {
                hashConfig: true,
                name: "hash"
            };
            lifetime = {
                lifetime: true
            };
            storagePrefix = "prefix/";
            storageService = storageServiceFactory(hashConfig, lifetime, storagePrefix);
        });
        it("exposes known methods", () => {
            expect(storageService).toEqual({
                deleteAsync: jasmine.any(Function),
                getAsync: jasmine.any(Function),
                putAsync: jasmine.any(Function)
            });
        });
        it("deletes", () => {
            return storageService.deleteAsync("id").then(() => {
                expect(storageMock.deleteAsync).toHaveBeenCalledWith("prefix/hash(id)");
            });
        });
        it("gets", () => {
            return storageService.getAsync("id").then((result) => {
                var args;

                expect(storageMock.getAsync).toHaveBeenCalledWith("prefix/hash(id)");
                args = recordMock.thawAsync.mostRecentCall.args;
                expect(Buffer.isBuffer(args[0])).toBe(true);
                expect(args[0].toString("binary")).toBe("record data");
                expect(args[1]).toBe("id");
                expect(args.length).toBe(2);
                expect(result).toBe("thawed");
            });
        });
        it("puts without metadata", () => {
            OtDateMock.stubNow().plus.andCallFake((lifetimeIn) => {
                expect(lifetimeIn).toEqual({
                    lifetime: true
                });

                return "lifetime was tested";
            });

            return storageService.putAsync("id", "record data").then(() => {
                /* eslint no-undefined:"off" */
                expect(recordMock.freezeAsync).toHaveBeenCalledWith("record data", "id", {
                    expires: "lifetime was tested"
                }, undefined);
            });
        });
        it("puts with metadata", () => {
            return storageService.putAsync("id", "record data", {
                meta: "data"
            }).then(() => {
                expect(recordMock.freezeAsync).toHaveBeenCalledWith("record data", "id", {
                    expires: jasmine.any(OtDateMock)
                }, {
                    meta: "data"
                });
            });
        });
    });
    describe("multiple hash configs", () => {
        var storageService;

        beforeEach(() => {
            var hashConfig, lifetime, storagePrefix;

            hashConfig = [
                {
                    hashConfig: true,
                    name: "hash"
                },
                {
                    hashConfig: true,
                    name: "hash2"
                }
            ];
            lifetime = {
                lifetime: true
            };
            storagePrefix = "prefix/";
            storageService = storageServiceFactory(hashConfig, lifetime, storagePrefix);
        });
        it("hashes an ID Array in order", () => {
            return storageService.deleteAsync([
                "id",
                "another thing"
            ]).then(() => {
                expect(storageMock.deleteAsync).toHaveBeenCalledWith("prefix/hash(id)/hash2(another thing)");
            });
        });
        it("loops if there are more inputs than hash configs", () => {
            return storageService.deleteAsync([
                "id",
                "another thing",
                "three"
            ]).then(() => {
                expect(storageMock.deleteAsync).toHaveBeenCalledWith("prefix/hash(id)/hash2(another thing)/hash(three)");
            });
        });
        it("decrypts with the right key", () => {
            return storageService.getAsync([
                "id-one",
                "id-two"
            ]).then((result) => {
                var args;

                expect(storageMock.getAsync).toHaveBeenCalledWith("prefix/hash(id-one)/hash2(id-two)");
                args = recordMock.thawAsync.mostRecentCall.args;
                expect(Buffer.isBuffer(args[0])).toBe(true);
                expect(args[0].toString("binary")).toBe("record data");
                expect(args[1]).toBe("id-two");
                expect(args.length).toBe(2);
                expect(result).toBe("thawed");
            });
        });
    });
});
