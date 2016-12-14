"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("templateMock", [
        "processTemplateAsync",
        "sendEmailAsync"
    ]);
    mock.processTemplateAsync.andCallFake(() => {
        return promiseMock.resolve("template rendered");
    });
    mock.sendEmailAsync.andCallFake(() => {
        return promiseMock.resolve();
    });

    return mock;
};
