"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("fsAsync", [
        "readFileAsync"
    ]);

    mock.readFileAsync.andReturn(promiseMock.reject(new Error("not configured")));

    return mock;
};
