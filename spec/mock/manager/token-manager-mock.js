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
    mock.createAsync.andReturn(promiseMock.resolve("tokenId"));
    mock.deleteAsync.andReturn(promiseMock.resolve());
    mock.getRecordAsync.andReturn(promiseMock.resolve());

    return mock;
};
