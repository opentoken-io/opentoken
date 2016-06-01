"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();
module.exports = () => {
    return {
        compare: jasmine.createSpy("secureHashMock.compare").andReturn(true),
        hashAsync: jasmine.createSpy("secureHashMock.hashAsync").andReturn(promiseMock.resolve("---hash---"))
    };
};
