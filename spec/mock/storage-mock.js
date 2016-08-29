"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();
module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("storageMock", [
        "configure",
        "deleteAsync",
        "getAsync",
        "putAsync"
    ]);

    mock.deleteAsync.andReturn(promiseMock.resolve(true));
    mock.getAsync.andReturn(promiseMock.resolve(new Buffer("record data")));
    mock.putAsync.andReturn(promiseMock.resolve(true));

    return mock;
};
