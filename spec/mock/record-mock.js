"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();
module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("recordMock", [
        "freezeAsync",
        "thawAsync"
    ]);
    mock.freezeAsync.and.returnValue(new Buffer("frozen", "binary"));
    mock.thawAsync.and.callFake(() => {
        return promiseMock.resolve("thawed");
    });

    return mock;
};
