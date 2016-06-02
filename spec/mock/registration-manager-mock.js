"use strict";

module.exports = () => {
    var mock, promiseMock;

    promiseMock = require("./promise-mock")();
    mock = jasmine.createSpyObj("registrationManagerMock", [
        "confirmEmailAsync",
        "qrCodeImageAsync",
        "registerAsync",
        "secureAsync",
        "secureInfoAsync"
    ]);
    mock.confirmEmailAsync.andReturn(promiseMock.resolve("account id"));
    mock.qrCodeImageAsync.andReturn(promiseMock.resolve(new Buffer("png data", "binary")));
    mock.registerAsync.andReturn(promiseMock.resolve({
        id: "id",
        secureInfo: {
            secure: "info"
        }
    }));
    mock.secureAsync.andReturn(promiseMock.resolve());
    mock.secureInfoAsync.andReturn(promiseMock.resolve({
        id: "id",
        secureInfo: {
            secure: "info"
        }
    }));

    return mock;
};
