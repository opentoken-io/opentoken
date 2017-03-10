"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("signatureOt1Mock", [
        "authenticateAsync"
    ]);
    mock.authenticateAsync.and.callFake(() => {
        return promiseMock.resolve();
    });

    return mock;
};
