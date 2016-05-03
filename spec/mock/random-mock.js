"use strict"

var random;

random = jasmine.createSpyObj("random", [
    "bufferAsync",
    "randomizedAsync"
]);

random.bufferAsync.andCallFake((size) => {
    var buff;

    buff = new Buffer(size);
    buff.fill(0x42);

    return new Promise((resolve, reject) => {
        resolve(buff);
    });
});

random.randomizedAsync.andCallFake((size) => {
    var buff;

    buff = new Buffer(size);
    buff.fill(0x42);

    return new Promise((resolve, reject) => {
        resolve(buff.toString());
    });
});

module.exports = random;


