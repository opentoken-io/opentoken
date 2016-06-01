"use strict";

describe("account/accountManager", () => {
    var accountServiceMock, factory, randomMock;

    beforeEach(() => {
        var promiseMock;

        promiseMock = require("../../mock/promise-mock")();
        accountServiceMock = jasmine.createSpyObj("accountServiceMock", [
            "put"
        ]);
        accountServiceMock.put.andReturn(promiseMock.resolve());
        randomMock = require("../../mock/random-mock")();
        factory = () => {
            var config;

            config = {
                account: {
                    idLength: 10,
                    passwordHash: {
                        algorithm: "algorithm",
                        derivedLength: "derivedLength",
                        encoding: "encoding",
                        iterations: "iterations",
                        type: "type"
                    },
                    passwordSaltLength: 20
                }
            };

            return require("../../../lib/account/account-manager")(accountServiceMock, config, promiseMock, randomMock);
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
            expect(accountServiceMock.put).toHaveBeenCalledWith("BBBBBBBBBB", record, {
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
