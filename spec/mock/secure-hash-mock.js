"use strict"

var secureHash;

function createSecureHashAsync (hashMe) {
    return new Promise((resolve, reject) => {
        resolve(hashMe + "_hashed");
    });
}

secureHash = jasmine.createSpyObj("secureHash", [
    "compare",
    "createHash",
    "encodeAsync",
    "encodeUriAsync"
]);
secureHash.compare.andCallFake((hashA, hashB) => {
    if (hashA.match("noMatch") || hashB.match("noMatch")) {
        return false;
    }

    return true;
});
secureHash.createHash.andCallFake((data) => {
    return data;
});
secureHash.encodeAsync.andCallFake((hashMe) => {
    return createSecureHashAsync(hashMe);

});
secureHash.encodeUriAsync.andCallFake((hashMe) => {
    return createSecureHashAsync(hashMe);

});

module.exports = secureHash;
