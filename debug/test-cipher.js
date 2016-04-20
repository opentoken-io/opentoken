#!/usr/bin/env node
"use strict";

var algorithm, crypto, data, deciphered, iterations, key, length, result, timer;

crypto = require("crypto");
timer = require("./timer");

if (process.argv.length < 4) {
    console.log("Usage:")
    console.log("");
    console.log("    test-cipher.js algorithm data-length [iterations]");
    console.log("");
    console.log("When data-length is 0, a test key and test message will be used.");
    process.exit();
}

algorithm = process.argv[2];
length = +process.argv[3];
iterations = +(process.argv[4] || 1);
console.log("algorithm:", algorithm);

if (length) {
    key = crypto.randomBytes(1024);
    data = crypto.randomBytes(length);
    console.log("length:", length);
} else {
    key = new Buffer("This is a test key.", "binary");
    data = new Buffer("This is a test message.", "binary");
    console.log("test:", true);
}

timer.run(() => {
    var cipher;

    cipher = crypto.createCipher(algorithm, key);
    result = cipher.update(data);
    result = Buffer.concat([
        result,
        cipher.final()
    ]);
}, iterations, "encrypt");

if (result.length < 256) {
    console.log(result.toString("hex"));
}

timer.run(() => {
    var cipher;

    cipher = crypto.createDecipher(algorithm, key);
    deciphered = cipher.update(result);
    deciphered = Buffer.concat([
        deciphered,
        cipher.final()
    ]);
}, iterations, "decrypt");
console.log("correct:", deciphered.toString("hex") == data.toString("hex"));
