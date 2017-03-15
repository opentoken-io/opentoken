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
    mock.createAsync.and.callFake(() => {
        return promiseMock.resolve("createdId");
    });
    mock.loginAsync.and.callFake(() => {
        return promiseMock.resolve({
            sessionId: "login-session-id"
        });
    });
    mock.loginHashConfigAsync.and.callFake(() => {
        return promiseMock.resolve("loginHashConfig");
    });
    mock.logoutAsync.and.callFake(() => {
        return promiseMock.resolve();
    });
    mock.passwordHashConfigAsync.and.callFake(() => {
        return promiseMock.resolve("accountManager.passwordHashConfig");
    });
    mock.recordAsync.and.callFake(() => {
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
