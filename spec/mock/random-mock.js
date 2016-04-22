"use strict"

var random;

random = jasmine.createSpyObj("random", [
    "password"
]);

random.password.andCallFake((size) => {
    var buff;

    buff = new Buffer(size);
    buff.fill(0x42);

    return new Promise((resolve, reject) => {
        resolve(buff);
    });
});

module.exports = random;


