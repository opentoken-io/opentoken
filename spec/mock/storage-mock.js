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
    mock.deleteAsync.andCallFake(() => {
        return promiseMock.resolve(true);
    });
    mock.getAsync.andCallFake(() => {
        return promiseMock.resolve(new Buffer("record data"));
    });
    mock.putAsync.andCallFake(() => {
        return promiseMock.resolve(true);
    });

    return mock;
};
