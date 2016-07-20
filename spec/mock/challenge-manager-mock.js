"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("challengeManagerMock", [
        "createAsync",
        "validateAsync"
    ]);
    mock.createAsync.andReturn(promiseMock.resolve({
        challengeConfig: "config for the challenge"
    }));
    mock.validateAsync.andReturn(promiseMock.resolve());

    return mock;
};
