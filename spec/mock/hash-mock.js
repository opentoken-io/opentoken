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

    mock.compare.andReturn(true);
    mock.deriveAsync.andReturn(promiseMock.resolve("---derived---"));
    mock.hash.andReturn("---hash---");
    mock.hmac.andReturn("---hmac---");

    return mock;
};
