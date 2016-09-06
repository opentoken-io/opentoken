"use strict";

describe("challengeManager", () => {
    var factory, hashMock, OtDateMock, promiseMock, storageService, storageServiceFactoryMock;

    beforeEach(() => {
        var randomMock, util;

        hashMock = require("../../mock/hash-mock")();
        OtDateMock = require("../../mock/ot-date-mock")();
        promiseMock = require("../../mock/promise-mock")();
        randomMock = require("../../mock/random-mock")();
        storageServiceFactoryMock = require("../../mock/storage-service-factory-mock")();
        util = require("../../../lib/util")();
        storageService = storageServiceFactoryMock.instance;

        factory = () => {
            var config;

            config = {
                challenge: {
                    challengeHash: {
                        algorithm: "-algorithm-",
                        encoding: "-encoding-"
                    },
                    idHash: {
                        idHash: "goes here"
                    },
                    idLength: 10,
                    lifetime: {
                        lifetime: "goes here"
                    },
                    storagePrefix: "anything"
                }
            };

            return require("../../../lib/manager/challenge-manager")(config, hashMock, OtDateMock, promiseMock, randomMock, storageServiceFactoryMock, util);
        };
    });
    it("exposes known methods", () => {
        expect(factory()).toEqual({
            createAsync: jasmine.any(Function),
            validateAsync: jasmine.any(Function)
        });
    });
    it("configured the storage service correctly", () => {
        factory();
        expect(storageServiceFactoryMock).toHaveBeenCalledWith({
            idHash: "goes here"
        }, {
            lifetime: "goes here"
        }, "anything");
    });
    describe(".createAsync()", () => {
        it("creates a new challenge when none existed", () => {
            storageService.getAsync.andReturn(promiseMock.resolve([]));
            OtDateMock.stubNow().plus.andReturn(OtDateMock.stubNow());

            return factory().createAsync("accountId").then((result) => {
                expect(result).toEqual({
                    algorithm: "-algorithm-",
                    encoding: "-encoding-",
                    salt: "BBBBBBBBBB"
                });
            });
        });
        it("creates a new challenge", () => {
            storageService.getAsync.andReturn(promiseMock.resolve([]));
            OtDateMock.stubNow().plus.andReturn(OtDateMock.stubNow());

            return factory().createAsync("accountId").then((result) => {
                expect(result).toEqual({
                    algorithm: "-algorithm-",
                    encoding: "-encoding-",
                    salt: "BBBBBBBBBB"
                });
            });
        });
    });
    describe(".validateAsync()", () => {
        beforeEach(() => {
            var date;

            date = OtDateMock.now();
            date.date.setTime(date.date.getTime() + 5000);
            storageService.getAsync.andReturn(promiseMock.resolve([
                {
                    expires: date,
                    id: "---hash---"
                }
            ]));
        });
        it("fails when no challenge IDs match", () => {
            return factory().validateAsync("accountId", "does-not-matter", "wrong").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Did not match any known challenge result");
            });
        });
        it("fails when the password hash doesn't match", () => {
            hashMock.hash.andReturn("will-not-match");

            return factory().validateAsync("accountId", "does-not-matter", "---hash---").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Did not match any known challenge result");
            });
        });
        it("passes when everything is correct", () => {
            return factory().validateAsync("accountId", "does-not-matter", "---hash---");
        });
        it("removes the challenge when it's validated", () => {
            return factory().validateAsync("accountId", "does-not-matter", "---hash---").then(() => {
                expect(storageService.putAsync).toHaveBeenCalledWith("accountId", []);
            });
        });
    });
    describe("loading lists", () => {
        it("returns an empty array when there was no data", () => {
            storageService.getAsync.andReturn(promiseMock.reject());
            OtDateMock.stubNow().plus.andReturn(OtDateMock.stubNow());

            return factory().createAsync("accountId").then(() => {
                expect(OtDateMock.stubNow().plus).toHaveBeenCalledWith({
                    lifetime: "goes here"
                });
                expect(storageService.putAsync).toHaveBeenCalledWith("accountId", [
                    {
                        expires: OtDateMock.stubNow(),
                        id: "BBBBBBBBBB"
                    }
                ]);
            });
        });
        it("filters invalid items", () => {
            var nowPlus5Seconds;

            nowPlus5Seconds = OtDateMock.now();
            nowPlus5Seconds.date.setTime(nowPlus5Seconds.date.getTime() + 5000);
            storageService.getAsync.andReturn(promiseMock.resolve([
                // These get filtered out
                "not an object",
                null,
                {},
                {
                    expires: new Date() - 1,
                    id: "expired"
                },

                // This one is kept
                {
                    expires: nowPlus5Seconds,
                    id: "valid for 5 seconds"
                }
            ]));
            OtDateMock.stubNow().plus.andReturn(OtDateMock.stubNow());

            return factory().createAsync("accountId").then(() => {
                expect(storageService.putAsync).toHaveBeenCalledWith("accountId", [
                    {
                        expires: nowPlus5Seconds,
                        id: "valid for 5 seconds"
                    },
                    {
                        expires: OtDateMock.stubNow(),
                        id: "BBBBBBBBBB"
                    }
                ]);
            });
        });
    });
});
