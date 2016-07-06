"use strict";

describe("accountManager", () => {
    var factory, randomMock, storageServiceFactoryMock;

    beforeEach(() => {
        var base64, challengeManagerMock, OtDateMock, promiseMock, recordMock, sessionManagerMock, totpMock;

        base64 = require("../../lib/base64");
        challengeManagerMock = require("../mock/challenge-manager-mock")();
        OtDateMock = require("../mock/ot-date-mock")();
        promiseMock = require("../mock/promise-mock")();
        randomMock = require("../mock/random-mock")();
        recordMock = require("../mock/record-mock")();
        storageServiceFactoryMock = require("../mock/storage-service-factory-mock")();
        sessionManagerMock = require("../mock/session-manager-mock")();
        totpMock = require("../mock/mfa/totp-mock")();
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

            return require("../../lib/account-manager")(base64, challengeManagerMock, config, OtDateMock, promiseMock, randomMock, recordMock, sessionManagerMock, storageServiceFactoryMock, totpMock);
        };
    });
    it("exposes known methods", () => {
        expect(factory()).toEqual({
            createAsync: jasmine.any(Function),
            loginAsync: jasmine.any(Function),
            loginHashConfigAsync: jasmine.any(Function),
            passwordHashConfigAsync: jasmine.any(Function),
            recordAsync: jasmine.any(Function)
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
