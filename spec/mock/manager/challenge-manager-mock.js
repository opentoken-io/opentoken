"use strict";

var promiseMock;

promiseMock = require("../promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("challengeManagerMock", [
        "createAsync",
        "validateAsync"
    ]);
    mock.createAsync.andCallFake(() => {
        return promiseMock.resolve({
            challengeConfig: "config for the challenge"
        });
    });
    mock.validateAsync.andCallFake(() => {
        return promiseMock.resolve();
    });

    return mock;
};
