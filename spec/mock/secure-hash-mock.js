"use strict"

var secureHash;

secureHash = jasmine.createSpyObj("secureHash", [
    "compare",
    "hashAsync",
    "simpleHash"
]);
secureHash.simpleHash.andCallFake((thing) => {
    return thing;
});
secureHash.compare.andCallFake((hashA, hashB) => {
    if (hashA.length == 20 || hashB.length == 20) {
        return false;
    }

    return true;
});
secureHash.hashAsync.andCallFake((hashMe) => {
    return new Promise((resolve, reject) => {
        resolve(hashMe + "_hashed");
    });
});

module.exports = secureHash;
