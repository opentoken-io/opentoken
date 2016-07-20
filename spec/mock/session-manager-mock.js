"use strict";

module.exports = () => {
    var mock, promiseMock;

    promiseMock = require("./promise-mock")();
    mock = jasmine.createSpyObj("sessionManagerMock", [
        "createAsync",
        "validateAsync"
    ]);
    mock.createAsync.andReturn(promiseMock.resolve("createdId"));
    mock.validateAsync.andReturn(promiseMock.resolve());

    return mock;
};
