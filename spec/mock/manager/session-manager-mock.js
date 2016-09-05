"use strict";

module.exports = () => {
    var mock, promiseMock;

    promiseMock = require("./promise-mock")();
    mock = jasmine.createSpyObj("sessionManagerMock", [
        "createAsync",
        "deleteAsync",
        "validateAsync"
    ]);
    mock.createAsync.andReturn(promiseMock.resolve("createdId"));
    mock.deleteAsync.andReturn(promiseMock.resolve());
    mock.validateAsync.andReturn(promiseMock.resolve());

    return mock;
};
