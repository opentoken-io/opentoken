#!/usr/bin/env node
"use strict";

var crypto, data, dataLength, digest, iterations, key, result, timer;

crypto = require("crypto");
timer = require("./timer");

if (process.argv.length < 4) {
    console.log("Usage:")
    console.log("");
    console.log("    test-hmac.js digest data_length [iterations]");
    console.log("");
    console.log("If data_length is 0, a static test message will be used.");
    process.exit();
}

digest = process.argv[2];
dataLength = +process.argv[3];
iterations = +(process.argv[4] || 1);
console.log("digest:", digest);

if (dataLength == 0) {
    key = new Buffer("This is a test key.", "binary");
    data = new Buffer("This is a test message.", "binary");
    console.log("test:", true);
} else {
    key = crypto.randomBytes(1024);
    data = crypto.randomBytes(dataLength);
    console.log("bytes:", dataLength);
}

timer.run(() => {
    var hmac;

    hmac = crypto.createHmac(digest, key);
    hmac.update(data);
    result = hmac.digest();
}, iterations);
console.log("hashLength:", result.length);
console.log(result.toString("hex"));
