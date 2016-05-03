"use strict"

var random;

random = jasmine.createSpyObj("random", [
    "bufferAsync",
    "randomIdAsync"
]);

random.bufferAsync.andCallFake((size) => {
    var buff;

    buff = new Buffer(size);
    buff.fill(0x42);

    return new Promise((resolve, reject) => {
        resolve(buff);
    });
});

random.randomIdAsync.andCallFake((size) => {
    var buff;

    buff = new Buffer(size);
    buff.fill(0x42);

    return new Promise((resolve, reject) => {
        resolve(buff.toString());
    });
});

module.exports = random;


