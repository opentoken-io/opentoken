"use strict";

var promiseMock;

promiseMock = require("../promise-mock")();
module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("totp", [
        "generateQrCodeAsync",
        "generateSecretAsync",
        "generateUrl",
        "verifyCurrent",
        "verifyCurrentAndPrevious"
    ]);
    mock.generateQrCodeAsync.and.callFake(() => {
        return promiseMock.resolve(Buffer.from("QR CODE PNG", "binary"));
    });
    mock.generateSecretAsync.and.callFake(() => {
        return promiseMock.resolve(Buffer.from("SECRET", "binary"));
    });
    mock.generateUrl.and.returnValue("url");
    mock.verifyCurrent.and.returnValue(true);
    mock.verifyCurrentAndPrevious.and.returnValue(true);

    return mock;
};
