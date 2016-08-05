"use strict";

module.exports = () => {
    var mock, promiseMock;

    promiseMock = require("./promise-mock")();
    mock = jasmine.createSpyObj("accountManagerMock", [
        "createAsync",
        "destroyAsync"
    ]);
    mock.createAsync.andReturn(promiseMock.resolve("createdId and other info"));
    mock.destroyAsync.andReturn(promiseMock.resolve());

    return mock;
};
