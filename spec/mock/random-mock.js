"use strict"

var random;

random = jasmine.createSpyObj("random", [
    "bufferAsync",
    "passwordAsync"
]);

random.bufferAsync.andCallFake((size) => {
    var buff;

    buff = new Buffer(size);
    buff.fill(0x42);

    return new Promise((resolve, reject) => {
        resolve(buff);
    });
});

random.passwordAsync.andCallFake((size) => {
    var buff;

    buff = new Buffer(size);
    buff.fill(0x42);

    return new Promise((resolve, reject) => {
        resolve(buff);
    });
});

module.exports = random;


