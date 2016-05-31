"use strict";

describe("registrationService", () => {
    var factory, OtDateMock, recordMock, secureHashMock, storageMock;

    beforeEach(() => {
        var promiseMock;

        OtDateMock = require("../../mock/ot-date-mock")();
        promiseMock = require("../../mock/promise-mock")();
        recordMock = require("../../mock/record-mock")();
        secureHashMock = require("../../mock/secure-hash-mock")();
        storageMock = require("../../mock/storage-mock")();
        factory = (override) => {
            var config;

            override = override || {};
            config = {
                registration: {
                    idHash: override.idHash || {
                        algorithm: "sha256",
                        hashLength: 24,
                        iterations: 10000
                    },
                    lifetime: override.lifetime || {
                        hours: 1
                    },
                    storagePrefix: override.storagePrefix || "somewhere/"
                }
            };

            return require("../../../lib/registration/registration-service")(config, OtDateMock, promiseMock, recordMock, secureHashMock, storageMock);
        };
    });
    describe(".delAsync()", () => {
        it("simply calls storage.delAsync()", (done) => {
            factory().delAsync("test").then((result) => {
                expect(result).toEqual(true);
                expect(secureHashMock.pbkdf2IdAsync).toHaveBeenCalledWith("test", {
                    algorithm: "sha256",
                    hashLength: 24,
                    iterations: 10000
                });
                expect(storageMock.delAsync).toHaveBeenCalledWith("somewhere/pbkdf2IdHash");
            }).then(done, done);
        });
        it("uses the right configuration for generating the key", (done) => {
            factory({
                idHash: {
                    algorithm: "whirlpool",
                    hashLength: 123,
                    iterations: 100
                }
            }).delAsync("test").then(() => {
                expect(secureHashMock.pbkdf2IdAsync).toHaveBeenCalledWith("test", {
                    algorithm: "whirlpool",
                    hashLength: 123,
                    iterations: 100
                });
            }).then(done, done);
        });
    });
    describe(".getAsync()", () => {
        it("gets the record and thaws the data", (done) => {
            factory().getAsync("test").then((result) => {
                var args;

                expect(result).toEqual("thawed");
                expect(storageMock.getAsync).toHaveBeenCalledWith("somewhere/pbkdf2IdHash");
                args = recordMock.thawAsync.mostRecentCall.args;
                expect(args[0] instanceof Buffer).toBe(true);
                expect(args[0].toString("binary")).toBe("record data");
                expect(args[1]).toBe("test");
                expect(args.length).toBe(2);
            }).then(done, done);
        });
        it("uses the storage prefix", (done) => {
            factory({
                storagePrefix: "elsewhere/"
            }).getAsync("test").then(() => {
                expect(storageMock.getAsync).toHaveBeenCalledWith("elsewhere/pbkdf2IdHash");
            }).then(done, done);
        });
    });
    describe(".putAsync()", () => {
        it("puts a basic record", (done) => {
            var otDate;

            otDate = OtDateMock.now();
            OtDateMock.now.andReturn(otDate);
            otDate.plus.andCallFake((lifetime) => {
                return lifetime;
            });
            factory().putAsync("test", "test record").then((result) => {
                /* eslint no-undefined:"off" */
                var args;

                expect(result).toEqual(true);
                expect(recordMock.freezeAsync).toHaveBeenCalledWith("test record", "test", {
                    expires: {
                        hours: 1
                    }
                }, undefined);
                args = storageMock.putAsync.mostRecentCall.args;
                expect(args[0]).toBe("somewhere/pbkdf2IdHash");
                expect(args[1] instanceof Buffer).toBe(true);
                expect(args[1].toString("binary")).toBe("frozen");
                expect(args[2]).toEqual({
                    expires: {
                        hours: 1
                    }
                });
                expect(args.length).toBe(3);
            }).then(done, done);
        });
        it("honors the lifetime in the config", (done) => {
            var otDate;

            otDate = OtDateMock.now();
            OtDateMock.now.andReturn(otDate);
            otDate.plus.andCallFake((lifetime) => {
                return lifetime;
            });
            factory({
                lifetime: {
                    seconds: 2
                }
            }).putAsync("test", "test record").then(() => {
                /* eslint no-undefined:"off" */
                var args;

                expect(recordMock.freezeAsync).toHaveBeenCalledWith("test record", "test", {
                    expires: {
                        seconds: 2
                    }
                }, undefined);
                args = storageMock.putAsync.mostRecentCall.args;
                expect(args[2]).toEqual({
                    expires: {
                        seconds: 2
                    }
                });
            }).then(done, done);
        });
    });
});
