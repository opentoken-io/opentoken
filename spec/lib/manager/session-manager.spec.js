"use strict";

describe("sessionManager", () => {
    var factory, promiseMock, randomMock, storageService, storageServiceFactoryMock;

    beforeEach(() => {
        var util;

        promiseMock = require("../../mock/promise-mock")();
        randomMock = require("../../mock/random-mock")();
        storageServiceFactoryMock = require("../../mock/storage-service-factory-mock")();
        util = require("../../../lib/util")();
        storageService = storageServiceFactoryMock.instance;

        factory = () => {
            var config;

            config = {
                account: {
                    idHash: {
                        idHash: "for the account ID"
                    }
                },
                session: {
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

            return require("../../../lib/manager/session-manager")(config, promiseMock, randomMock, storageServiceFactoryMock, util);
        };
    });
    it("exposes known methods", () => {
        // This detects when a function is added or removed.  When it is
        // added, make sure to add tests.
        expect(factory()).toEqual({
            createAsync: jasmine.any(Function),
            deleteAsync: jasmine.any(Function),
            validateAsync: jasmine.any(Function)
        });
    });
    it("configured the storage service correctly", () => {
        factory();
        expect(storageServiceFactoryMock).toHaveBeenCalledWith([
            {
                idHash: "for the account ID"
            },
            {
                idHash: "goes here"
            }
        ], {
            lifetime: "goes here"
        }, "anything");
    });
    describe(".createAsync()", () => {
        it("creates a session", () => {
            return factory().createAsync("accountId").then((result) => {
                expect(randomMock.idAsync).toHaveBeenCalledWith(10);
                expect(storageService.putAsync).toHaveBeenCalledWith([
                    "accountId",
                    "BBBBBBBBBB"
                ], {
                    accountId: "accountId"
                });
                expect(result).toBe("BBBBBBBBBB");
            });
        });
    });
    describe(".deleteAsync()", () => {
        it("issues a delete", () => {
            return factory().deleteAsync("accountId", "sessionId").then(() => {
                expect(storageService.deleteAsync).toHaveBeenCalledWith([
                    "accountId",
                    "sessionId"
                ]);
            });
        });
    });
    describe(".validateAsync()", () => {
        beforeEach(() => {
            storageService.getAsync.and.callFake(() => {
                return promiseMock.resolve({
                    accountId: "accountId"
                });
            });
        });
        it("validates a good session", () => {
            return factory().validateAsync("accountId", "sessionId").then(() => {
                expect(storageService.putAsync).toHaveBeenCalledWith("sessionId", {
                    accountId: "accountId"
                });
            });
        });
        it("confirms the account ID is as expected", () => {
            storageService.getAsync.and.callFake(() => {
                return promiseMock.resolve({
                    accountId: "wrong"
                });
            });

            return factory().validateAsync("accountId", "sessionId").then(() => {
                jasmine.fail();
            }, (err) => {
                expect(err.toString()).toContain("Session is for wrong account");
            });
        });
        it("does not wait for the sessions to be refreshed", () => {
            storageService.putAsync.and.callFake(() => {
                // Purposely do not resolve this promise.  If we depend on this
                // unresolved promise, then the test will time out and fail.
                return new Promise(() => {});
            });

            return factory().validateAsync("accountId", "sessionId");
        });
    });
});
