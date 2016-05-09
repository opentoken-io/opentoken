"use strict"

var secureHash;

secureHash = jasmine.createSpyObj("secureHash", [
    "compare",
    "hashAsync"
]);
secureHash.compare.andCallFake((hashA, hashB) => {
    if (hashA.match("noMatch")) {

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
