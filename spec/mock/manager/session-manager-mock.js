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
    mock.createAsync.andCallFake(() => {
        return promiseMock.resolve("createdId");
    });
    mock.deleteAsync.andCallFake(() => {
        return promiseMock.resolve();
    });
    mock.validateAsync.andCallFake(() => {
        return promiseMock.resolve();
    });

    return mock;
};
