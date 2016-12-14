"use strict";

var promiseMock;

promiseMock = require("../promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("tokenManagerMock", [
        "createAsync",
        "deleteAsync",
        "getRecordAsync"
    ]);
    mock.createAsync.andCallFake(() => {
        return promiseMock.resolve("tokenId");
    });
    mock.deleteAsync.andCallFake(() => {
        return promiseMock.resolve();
    });
    mock.getRecordAsync.andCallFake(() => {
        return promiseMock.resolve();
    });

    return mock;
};
