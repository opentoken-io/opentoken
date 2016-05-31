"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();
module.exports = () => {
    return {
        configure: jasmine.createSpy("storageMock.configure"),
        delAsync: jasmine.createSpy("storageMock.delAsync").andReturn(promiseMock.resolve(true)),
        getAsync: jasmine.createSpy("storageMock.getAsync").andReturn(promiseMock.resolve(new Buffer("record data"))),
        putAsync: jasmine.createSpy("storageMock.putAsync").andReturn(promiseMock.resolve(true))
    };
};
