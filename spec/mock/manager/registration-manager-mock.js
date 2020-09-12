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
    mock.confirmEmailAsync.and.callFake(() => {
        return promiseMock.resolve("account id");
    });
    mock.getRecordAsync.and.callFake(() => {
        return promiseMock.resolve({
            id: "id",
            record: {
                secure: "info"
            }
        });
    });
    mock.qrCodeImageAsync.and.callFake(() => {
        return promiseMock.resolve(Buffer.from("png data", "binary"));
    });
    mock.registerAsync.and.callFake(() => {
        return promiseMock.resolve({
            id: "id",
            record: {
                secure: "info"
            }
        });
    });
    mock.secureAsync.and.callFake(() => {
        return promiseMock.resolve({
            id: "id",
            record: {
                secure: "info"
            }
        });
    });

    return mock;
};
