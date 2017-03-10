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
    mock.createAsync.and.callFake(() => {
        return promiseMock.resolve("tokenId");
    });
    mock.deleteAsync.and.callFake(() => {
        return promiseMock.resolve();
    });
    mock.getRecordAsync.and.callFake(() => {
        return promiseMock.resolve();
    });

    return mock;
};
