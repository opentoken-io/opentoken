"use strict";

var promiseMock;

promiseMock = require("../promise-mock")();

module.exports = () => {
    var mock;

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
