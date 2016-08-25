"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("errorResponseMock", [
        "createAsync",
        "rejectedPromiseAsync"
    ]);
    mock.createAsync.andCallFake((message, code) => {
        return promiseMock.resolve({
            logRef: "fakeLogref",
            message,
            code
        });
    });
    mock.rejectedPromiseAsync.andCallFake((message, code) => {
        return mock.createAsync(message, code).then((err) => {
            throw err;
        });
    });

    return mock;
};
