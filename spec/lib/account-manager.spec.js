"use strict";

describe("accountManager", () => {
    var factory, randomMock, storageServiceFactoryMock;

    beforeEach(() => {
        var promiseMock;

        promiseMock = require("../mock/promise-mock")();
        randomMock = require("../mock/random-mock")();
        storageServiceFactoryMock = require("../mock/storage-service-factory-mock")();
        factory = () => {
            var config;

            config = {
                account: {
                    idHash: {},
                    idLength: 10,
                    lifetime: {},
                    passwordHash: {
                        algorithm: "algorithm",
                        derivedLength: "derivedLength",
                        encoding: "encoding",
                        iterations: "iterations",
                        type: "type"
                    },
                    passwordSaltLength: 20,
                    storagePrefix: "anything"
                }
            };

            return require("../../lib/account-manager")(config, promiseMock, randomMock, storageServiceFactoryMock);
        };
    });
    it("exposes known methods", () => {
        expect(factory()).toEqual({
            createAsync: jasmine.any(Function),
            passwordHashConfigAsync: jasmine.any(Function)
        });
    });
    it("creates an account", (done) => {
        var manager, record;

        record = {
            email: "test@example.com",
            record: true
        };
        manager = factory();
        manager.createAsync(record).then((result) => {
            expect(randomMock.idAsync).toHaveBeenCalledWith(10);
            expect(storageServiceFactoryMock.instance.putAsync).toHaveBeenCalledWith("BBBBBBBBBB", record, {
                email: record.email
            });
            expect(result).toBe("BBBBBBBBBB");
        }).then(done, done);
    });
    it("creates a password hash structure", (done) => {
        var manager;

        manager = factory();
        manager.passwordHashConfigAsync().then((passwordHash) => {
            expect(passwordHash).toEqual({
                algorithm: "algorithm",
                derivedLength: "derivedLength",
                encoding: "encoding",
                iterations: "iterations",
                salt: "BBBBBBBBBBBBBBBBBBBB",
                type: "type"
            });
        }).then(done, done);
    });
});
