"use strict";

describe("sessionManager", () => {
    var factory, promiseMock, randomMock, storageService, storageServiceFactoryMock;

    beforeEach(() => {
        var hashMock, OtDateMock;

        hashMock = require("../mock/hash-mock")();
        OtDateMock = require("../mock/ot-date-mock")();
        promiseMock = require("../mock/promise-mock")();
        randomMock = require("../mock/random-mock")();
        storageServiceFactoryMock = require("../mock/storage-service-factory-mock")();
        storageService = storageServiceFactoryMock.instance;

        factory = () => {
            var config;

            config = {
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

            return require("../../lib/session-manager")(config, hashMock, OtDateMock, promiseMock, randomMock, storageServiceFactoryMock);
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
        it("creates a session", () => {
            return factory().createAsync("accountId").then((result) => {
                expect(randomMock.idAsync).toHaveBeenCalledWith(10);
                expect(storageServiceFactoryMock.instance.putAsync).toHaveBeenCalledWith("BBBBBBBBBB", {
                    accountId: "accountId"
                });
                expect(result).toBe("BBBBBBBBBB");
            });
        });
    });
    describe(".validateAsync()", () => {
        beforeEach(() => {
            storageService.getAsync.andReturn(promiseMock.resolve({
                accountId: "accountId"
            }));
        });
        it("validates a good session", () => {
            return factory().validateAsync("sessionId", "accountId").then(() => {
                expect(storageService.putAsync).toHaveBeenCalledWith("sessionId", {
                    accountId: "accountId"
                });
            });
        });
        it("rejects when the session ID is empty", () => {
            return factory().validateAsync("", "accountId").then(() => {
                jasmine.fail();
            }, (err) => {
                expect(err.toString()).toContain("No session ID");
            });
        });
        it("confirms the account ID is as expected", () => {
            storageService.getAsync.andReturn(promiseMock.resolve({
                accountId: "wrong"
            }));

            return factory().validateAsync("sessionId", "accountId").then(() => {
                jasmine.fail();
            }, (err) => {
                expect(err.toString()).toContain("Session is for wrong account");
            });
        });
        it("does not wait for the sessions to be refreshed", () => {
            var promise;

            // Purposely do not resolve this promise.  If we depend on this
            // unresolved promise, then the test will time out and fail.
            promise = new Promise(() => {});
            storageService.putAsync.andReturn(promise);

            return factory().validateAsync("sessionId", "accountId");
        });
    });
});
