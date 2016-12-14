"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var random;

    random = jasmine.createSpyObj("random", [
        "bufferAsync",
        "idAsync"
    ]);

    random.bufferAsync.andCallFake((size) => {
        var buff;

        buff = new Buffer(size);
        buff.fill(0x42);

        return promiseMock.resolve(buff);
    });

    random.idAsync.andCallFake((size) => {
        var buff;

        buff = new Buffer(size);

        // Fill with the letter B, BBBBBBBBBBBBB... etc
        buff.fill(0x42);

        return promiseMock.resolve(buff.toString());
    });

    return random;
};
