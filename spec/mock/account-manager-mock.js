"use strict";

module.exports = () => {
    var mock, promiseMock;

    promiseMock = require("./promise-mock")();
    mock = jasmine.createSpyObj("accountManagerMock", [
        "createAsync",
        "passwordHashConfigAsync"
    ]);
    mock.createAsync.andReturn(promiseMock.resolve("createdId"));
    mock.passwordHashConfigAsync.andReturn(promiseMock.resolve("accountManager.passwordHashConfig"));

    return mock;
};
