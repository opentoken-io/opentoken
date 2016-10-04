"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("templateMock", [
        "processTemplateAsync",
        "sendEmailAsync"
    ]);
    mock.processTemplateAsync.andReturn(promiseMock.resolve("template rendered"));
    mock.sendEmailAsync.andReturn(promiseMock.resolve());

    return mock;
};
