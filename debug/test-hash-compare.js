#!/usr/bin/env node
"use strict";

var against, bad, container, good, options, secureHash, size;

options = process.argv.slice(2);

if (options.length < 1) {
    console.log("Test Hash Comparison \n");
    console.log("Usage: ./test-hash-compare.js timeToRunFor [iterations]\n");
    console.log("timeToRunFor: time the test will run in seconds");
    console.log("iterations: how many times to run through the tests, default is 2");

    return;
}

console.log("Setting Up...");

container = require("../lib/dependencies");
secureHash = container.resolve("secureHash");

size = 1024 * 16;
against = new Buffer(size);
against.fill(0x42);
good = new Buffer(size);
good.fill(0x42);
bad = new Buffer(size);
bad.fill(0x00);

function runIterations(maxTimes) {
    var badTimes, goodTimes, iterations, start, timeToRunFor;

    iterations = 0;
    while(iterations < maxTimes) {
        goodTimes = 0;
        badTimes = 0;
        timeToRunFor = options[0];

        console.log("Running " + (iterations + 1) + " out of " + maxTimes + "...");

        // run good
        start = process.hrtime();
        while((process.hrtime()[0] - start[0]) < timeToRunFor) {
            secureHash.compare(against, good);
            goodTimes += 1;
        }

        console.log("  Times Good Hashes Ran: ", goodTimes);

        // run bad
        start = process.hrtime();
        while((process.hrtime()[0] - start[0]) < timeToRunFor) {
            secureHash.compare(against, bad);
            badTimes += 1;
        }

        console.log("   Times Bad Hashes Ran: ", badTimes);

        iterations += 1;
    }
}

runIterations(options[1] || 2);