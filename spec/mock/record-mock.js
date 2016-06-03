"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();
module.exports = () => {
    return {
        freezeAsync: jasmine.createSpy("recordMock.freezeAsync").andReturn(promiseMock.resolve(new Buffer("frozen", "binary"))),
        thawAsync: jasmine.createSpy("recordMock.thatAwync").andReturn(promiseMock.resolve("thawed"))
    };
};
