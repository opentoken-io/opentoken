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
    mock.createAsync.andReturn(promiseMock.resolve("createdId"));
    mock.loginAsync.andReturn(promiseMock.resolve({
        sessionId: "login-session-id"
    }));
    mock.loginHashConfigAsync.andReturn(promiseMock.resolve("loginHashConfig"));
    mock.logoutAsync.andReturn(promiseMock.resolve());
    mock.passwordHashConfigAsync.andReturn(promiseMock.resolve("accountManager.passwordHashConfig"));
    mock.recordAsync.andReturn(promiseMock.resolve({
        id: "record-id",
        login: "new-login-cookie",
        record: {
            challengeHashConfig: "record-challenge-hash-config",
            email: "record-email",
            passwordHashConfig: "record-password-hash-config"
        }
    }));

    return mock;
};
