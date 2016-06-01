"use strict";

describe("account/accountService", () => {
    var factory, OtDateMock, recordMock, storageMock;

    beforeEach(() => {
        OtDateMock = require("../../mock/ot-date-mock")();
        recordMock = require("../../mock/record-mock")();
        storageMock = require("../../mock/storage-mock")();
        factory = () => {
            var config;

            config = {
                account: {
                    lifetime: "lifetime",
                    storagePrefix: "storagePrefix/"
                }
            };

            return require("../../../lib/account/account-service")(config, OtDateMock, recordMock, storageMock);
        };
    });
    it("exposes known methods", () => {
        expect(factory()).toEqual({
            delAsync: jasmine.any(Function),
            getAsync: jasmine.any(Function),
            putAsync: jasmine.any(Function)
        });
    });
    it("deletes", (done) => {
        var service;

        service = factory();
        service.delAsync("id").then(() => {
            expect(storageMock.delAsync).toHaveBeenCalledWith("storagePrefix/id");
        }).then(done, done);
    });
    it("gets", (done) => {
        var service;

        service = factory();
        service.getAsync("id", "innerkey").then((result) => {
            var args;

            expect(storageMock.getAsync).toHaveBeenCalledWith("storagePrefix/id");
            args = recordMock.thawAsync.mostRecentCall.args;
            expect(Buffer.isBuffer(args[0])).toBe(true);
            expect(args[0].toString("binary")).toBe("record data");
            expect(args[1]).toBe("innerkey");
            expect(args.length).toBe(2);
            expect(result).toBe("thawed");
        }).then(done, done);
    });
    it("puts without metadata", (done) => {
        var otDate, service;

        service = factory();
        otDate = OtDateMock.now();
        OtDateMock.now.andReturn(otDate);
        otDate.plus.andCallFake((lifetime) => {
            return lifetime;
        });
        service.putAsync("id", "innerkey", "record data").then(() => {
            /* eslint no-undefined:"off" */
            expect(recordMock.freezeAsync).toHaveBeenCalledWith("record data", "innerkey", {
                expires: "lifetime"
            }, undefined);
        }).then(done, done);
    });
    it("puts with metadata", (done) => {
        var service;

        service = factory();
        service.putAsync("id", "innerkey", "record data", {
            meta: "data"
        }).then(() => {
            /* eslint no-undefined:"off" */
            expect(recordMock.freezeAsync).toHaveBeenCalledWith("record data", "innerkey", {
                expires: jasmine.any(OtDateMock)
            }, {
                meta: "data"
            });
        }).then(done, done);
    });
});
