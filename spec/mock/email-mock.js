"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("emailMock", [
        "sendAsync"
    ]);
    mock.sendAsync.and.callFake(() => {
        return promiseMock.resolve();
    });

    return mock;
};
