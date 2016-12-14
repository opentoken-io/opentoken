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
    mock.confirmEmailAsync.andCallFake(() => {
        return promiseMock.resolve("account id");
    });
    mock.getRecordAsync.andCallFake(() => {
        return promiseMock.resolve({
            id: "id",
            record: {
                secure: "info"
            }
        });
    });
    mock.qrCodeImageAsync.andCallFake(() => {
        return promiseMock.resolve(new Buffer("png data", "binary"));
    });
    mock.registerAsync.andCallFake(() => {
        return promiseMock.resolve({
            id: "id",
            record: {
                secure: "info"
            }
        });
    });
    mock.secureAsync.andCallFake(() => {
        return promiseMock.resolve({
            id: "id",
            record: {
                secure: "info"
            }
        });
    });

    return mock;
};
