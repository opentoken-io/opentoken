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
    mock.generateQrCodeAsync.andReturn(promiseMock.resolve(new Buffer("QR CODE PNG", "binary")));
    mock.generateSecretAsync.andReturn(promiseMock.resolve(new Buffer("SECRET", "binary")));
    mock.generateUrl.andReturn("url");
    mock.verifyCurrent.andReturn(true);
    mock.verifyCurrentAndPrevious.andReturn(true);

    return mock;
};
