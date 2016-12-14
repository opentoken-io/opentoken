"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("signatureOt1Mock", [
        "authenticateAsync"
    ]);
    mock.authenticateAsync.andCallFake(() => {
        return promiseMock.resolve();
    });

    return mock;
};
