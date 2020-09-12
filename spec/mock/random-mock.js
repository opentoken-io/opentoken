"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var random;

    random = jasmine.createSpyObj("random", [
        "bufferAsync",
        "idAsync"
    ]);

    random.bufferAsync.and.callFake((size) => {
        var buff;

        buff = Buffer.alloc(size, 0x42);

        return promiseMock.resolve(buff);
    });

    random.idAsync.and.callFake((size) => {
        var buff;

        // Fill with the letter B, BBBBBBBBBBBBB... etc
        buff = Buffer.alloc(size, 0x42);

        return promiseMock.resolve(buff.toString());
    });

    return random;
};
