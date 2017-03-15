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
    mock.deleteAsync.and.callFake(() => {
        return promiseMock.resolve(true);
    });
    mock.getAsync.and.callFake(() => {
        return promiseMock.resolve(new Buffer("record data"));
    });
    mock.putAsync.and.callFake(() => {
        return promiseMock.resolve(true);
    });

    return mock;
};
