"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();
module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("recordMock", [
        "freezeAsync",
        "thawAsync"
    ]);
    mock.freezeAsync.andReturn(new Buffer("frozen", "binary"));
    mock.thawAsync.andCallFake(() => {
        return promiseMock.resolve("thawed");
    });

    return mock;
};
