"use strict";

var OtDateMock;

OtDateMock = require("./ot-date-mock")();

module.exports = () => {
    var mock, promiseMock;

    promiseMock = require("./promise-mock")();
    mock = jasmine.createSpyObj("accessCodeManagerMock", [
        "createAsync",
        "destroyAsync",
        "getAsync"
    ]);
    mock.createAsync.andReturn(promiseMock.resolve({
        code: "access code",
        expires: OtDateMock.fromString("2010-01-23T02:30:00Z"),
        secret: "access code secret"
    }));
    mock.destroyAsync.andReturn(promiseMock.resolve());
    mock.getAsync.andReturn(promiseMock.resolve({
        description: "This is a fake access code for tests",
        secret: "Secret key"
    }));

    return mock;
};
