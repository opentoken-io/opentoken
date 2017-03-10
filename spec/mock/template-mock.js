"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("templateMock", [
        "processTemplateAsync",
        "sendEmailAsync"
    ]);
    mock.processTemplateAsync.and.callFake(() => {
        return promiseMock.resolve("template rendered");
    });
    mock.sendEmailAsync.and.callFake(() => {
        return promiseMock.resolve();
    });

    return mock;
};
