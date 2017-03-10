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
    mock.createAsync.and.callFake(() => {
        return promiseMock.resolve("createdId");
    });
    mock.deleteAsync.and.callFake(() => {
        return promiseMock.resolve();
    });
    mock.validateAsync.and.callFake(() => {
        return promiseMock.resolve();
    });

    return mock;
};
