"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();
module.exports = () => {
    return {
        compare: jasmine.createSpy("hashMock.compare").andReturn(true),
        deriveAsync: jasmine.createSpy("hashMock.deriveAsync").andReturn(promiseMock.resolve("---derived---")),
        hashAsync: jasmine.createSpy("hashMock.hashAsync").andReturn(promiseMock.resolve("---hash---"))
    };
};
