#!/usr/bin/env node

"use strict";

var ciphersAndHashes;

ciphersAndHashes = require("../lib/ciphers-and-hashes");

console.log("Cipher, IV bytes, Key bytes");
console.log("---------------------------");
Object.keys(ciphersAndHashes.ciphers).forEach((cipherName) => {
    var cipher;

    cipher = ciphersAndHashes.ciphers[cipherName];
    console.log(cipherName + "\t" + cipher.ivBytes + "\t" + cipher.keyBytes);
});

console.log("");
console.log("Hash, binary result bytes");
console.log("-------------------------");
Object.keys(ciphersAndHashes.hashes).forEach((hashName) => {
    var hash;

    hash = ciphersAndHashes.hashes[hashName];
    console.log(hashName + "\t" + hash.hashLength);
});
