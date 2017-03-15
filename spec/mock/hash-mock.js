"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();
module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("hashMock", [
        "compare",
        "deriveAsync",
        "hash",
        "hmac"
    ]);

    mock.compare.and.returnValue(true);
    mock.deriveAsync.and.callFake(() => {
        return promiseMock.resolve("---derived---");
    });
    mock.hash.and.returnValue("---hash---");
    mock.hmac.and.returnValue("---hmac---");

    return mock;
};
