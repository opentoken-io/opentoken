#!/usr/bin/env node
"use strict";

var crypto, digest, iterations, key, result, rounds, timer;

crypto = require("crypto");
timer = require("./timer");

if (process.argv.length < 4) {
    console.log("Usage:")
    console.log("");
    console.log("    test-pbkdf2.js digest rounds [iterations]");
    process.exit();
}

digest = process.argv[2];
rounds = +process.argv[3];
iterations = +(process.argv[4] || 1);
key = crypto.randomBytes(1024);
console.log("digest:", digest);
console.log("rounds:", rounds);
timer.run(() => {
    result = crypto.pbkdf2Sync(key, new Buffer(0), rounds, 32, digest);
}, iterations);
console.log(result.toString("hex"));
