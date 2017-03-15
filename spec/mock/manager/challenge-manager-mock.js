"use strict";

var promiseMock;

promiseMock = require("../promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("challengeManagerMock", [
        "createAsync",
        "validateAsync"
    ]);
    mock.createAsync.and.callFake(() => {
        return promiseMock.resolve({
            challengeConfig: "config for the challenge"
        });
    });
    mock.validateAsync.and.callFake(() => {
        return promiseMock.resolve();
    });

    return mock;
};
