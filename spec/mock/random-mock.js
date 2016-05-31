"use strict";

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

        return new Promise((resolve) => {
            resolve(buff);
        });
    });

    random.idAsync.andCallFake((size) => {
        var buff;

        buff = new Buffer(size);
        buff.fill(0x42);

        return new Promise((resolve) => {
            resolve(buff.toString());
        });
    });

    return random;
};
