"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();
module.exports = () => {
    return {
        compare: jasmine.createSpy("promiseMock.compare").andReturn(true),
        pbkdf2Async: jasmine.createSpy("promiseMock.pbkdf2Async").andReturn(promiseMock.resolve(new Buffer("pbkdf2-hash", "binary"))),
        pbkdf2IdAsync: jasmine.createSpy("promiseMock.pbkdf2IdAsync").andReturn(promiseMock.resolve("pbkdf2IdHash"))
    };
};
