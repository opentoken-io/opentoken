"use strict";

var promiseMock;

promiseMock = require("../promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("accountManagerMock", [
        "createAsync",
        "loginAsync",
        "loginHashConfigAsync",
        "logoutAsync",
        "passwordHashConfigAsync",
        "recordAsync"
    ]);
    mock.createAsync.andCallFake(() => {
        return promiseMock.resolve("createdId");
    });
    mock.loginAsync.andCallFake(() => {
        return promiseMock.resolve({
            sessionId: "login-session-id"
        });
    });
    mock.loginHashConfigAsync.andCallFake(() => {
        return promiseMock.resolve("loginHashConfig");
    });
    mock.logoutAsync.andCallFake(() => {
        return promiseMock.resolve();
    });
    mock.passwordHashConfigAsync.andCallFake(() => {
        return promiseMock.resolve("accountManager.passwordHashConfig");
    });
    mock.recordAsync.andCallFake(() => {
        return promiseMock.resolve({
            id: "record-id",
            login: "new-login-cookie",
            record: {
                challengeHashConfig: "record-challenge-hash-config",
                email: "record-email",
                passwordHashConfig: "record-password-hash-config"
            }
        });
    });

    return mock;
};
