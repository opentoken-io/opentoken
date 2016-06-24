"use strict";

describe("storageServiceFactory", () => {
    var hashMock, OtDateMock, promiseMock, recordMock, storageMock, storageServiceFactory;

    beforeEach(() => {
        OtDateMock = require("../mock/ot-date-mock")();
        promiseMock = require("../mock/promise-mock")();
        recordMock = require("../mock/record-mock")();
        hashMock = require("../mock/hash-mock")();
        hashMock.deriveAsync.andCallFake((input) => {
            return promiseMock.resolve(`hash(${input})`);
        });
        storageMock = require("../mock/storage-mock")();
        storageServiceFactory = require("../../lib/storage-service-factory")(hashMock, OtDateMock, promiseMock, recordMock, storageMock);
    });
    it("returns a function (hopefully a factory)", () => {
        expect(storageServiceFactory).toEqual(jasmine.any(Function));
    });
    describe("instance", () => {
        var hashConfig, lifetime, storagePrefix, storageService;

        beforeEach(() => {
            hashConfig = {
                hashConfig: true
            };
            lifetime = {
                lifetime: true
            };
            storagePrefix = "prefix/";
            storageService = storageServiceFactory(hashConfig, lifetime, storagePrefix);
        });
        it("exposes known methods", () => {
            expect(storageService).toEqual({
                delAsync: jasmine.any(Function),
                getAsync: jasmine.any(Function),
                putAsync: jasmine.any(Function)
            });
        });
        it("deletes", (done) => {
            storageService.delAsync("id").then(() => {
                expect(storageMock.delAsync).toHaveBeenCalledWith("prefix/hash(id)");
            }).then(done, done);
        });
        it("gets", (done) => {
            storageService.getAsync("id").then((result) => {
                var args;

                expect(storageMock.getAsync).toHaveBeenCalledWith("prefix/hash(id)");
                args = recordMock.thawAsync.mostRecentCall.args;
                expect(Buffer.isBuffer(args[0])).toBe(true);
                expect(args[0].toString("binary")).toBe("record data");
                expect(args[1]).toBe("id");
                expect(args.length).toBe(2);
                expect(result).toBe("thawed");
            }).then(done, done);
        });
        it("puts without metadata", (done) => {
            OtDateMock.stubNow().plus.andCallFake((lifetimeIn) => {
                expect(lifetimeIn).toEqual({
                    lifetime: true
                });

                return "lifetime was tested";
            });
            storageService.putAsync("id", "record data").then(() => {
                /* eslint no-undefined:"off" */
                expect(recordMock.freezeAsync).toHaveBeenCalledWith("record data", "id", {
                    expires: "lifetime was tested"
                }, undefined);
            }).then(done, done);
        });
        it("puts with metadata", (done) => {
            storageService.putAsync("id", "record data", {
                meta: "data"
            }).then(() => {
                expect(recordMock.freezeAsync).toHaveBeenCalledWith("record data", "id", {
                    expires: jasmine.any(OtDateMock)
                }, {
                    meta: "data"
                });
            }).then(done, done);
        });
    });
});
