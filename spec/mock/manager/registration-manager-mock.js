"use strict";

var promiseMock;

promiseMock = require("../promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("registrationManagerMock", [
        "confirmEmailAsync",
        "getRecordAsync",
        "qrCodeImageAsync",
        "registerAsync",
        "secureAsync"
    ]);
    mock.confirmEmailAsync.andReturn(promiseMock.resolve("account id"));
    mock.getRecordAsync.andReturn(promiseMock.resolve({
        id: "id",
        record: {
            secure: "info"
        }
    }));
    mock.qrCodeImageAsync.andReturn(promiseMock.resolve(new Buffer("png data", "binary")));
    mock.registerAsync.andReturn(promiseMock.resolve({
        id: "id",
        record: {
            secure: "info"
        }
    }));
    mock.secureAsync.andReturn(promiseMock.resolve({
        id: "id",
        record: {
            secure: "info"
        }
    }));

    return mock;
};
