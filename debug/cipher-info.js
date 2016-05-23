#!/usr/bin/env node
/* eslint no-process-exit:0 */
"use strict";

var algorithm, crypto, result;

/**
 * Attempt to see if a key/IV length works for a cipher
 *
 * @param {number} keyLen Length of key to try
 * @param {number} ivLen Length of IV to try
 * @throws {Error} when it does not work
 */
function attempt(keyLen, ivLen) {
    var iv, key;

    key = new Buffer(keyLen);
    iv = new Buffer(ivLen);
    crypto.createCipheriv(algorithm, key, iv);
}

/**
 * When found, the key and IV sizes are reported in an object like this one.
 *
 * @typedef {Object} cipherInfo~keySize
 * @property {number} keyBytes
 * @property {number} ivBytes
 */

/**
 * Scan through a bunch of lengths, looking for key and IV lengths.
 *
 * @param {number} startKey Starting key length
 * @param {number} startIv Starting IV length
 * @param {number} modKey How to modify the key length
 * @param {number} modIv How to modify the IV length
 * @param {number} endKey When to stop searching for key lengths
 * @param {number} endIv When to stop searching for IV lengths
 * @return {(cipherInfo~keySize|null)} Results object (keyBytes and ivBytes) or error
 */
function scan(startKey, startIv, modKey, modIv, endKey, endIv) {
    var cont, ivBytes, keyBytes;

    keyBytes = startKey;
    ivBytes = startIv;
    cont = true;

    while (cont) {
        try {
            attempt(keyBytes, ivBytes);

            return {
                keyBytes,
                ivBytes
            };
        } catch (e) {
            if (e.toString().indexOf("Invalid IV length") >= 0) {
                if (ivBytes === endIv) {
                    console.error("Missed the IV");

                    return null;
                }

                ivBytes += modIv;
            } else if (e.toString().indexOf("Invalid key length") >= 0) {
                if (keyBytes === endKey) {
                    console.error("Missed the key");

                    return null;
                }

                keyBytes += modKey;
            } else {
                cont = false;

                return null;
            }
        }
    }

    return null;
}


/**
 * Show the results
 *
 * @param {cipherInfo~keySize} resultObj Object returned from scan()
 * @param {string} suffix Suffix to use when displaying
 */
function show(resultObj, suffix) {
    if (resultObj) {
        console.log(`ivBytes${suffix}:`, result.ivBytes);
        console.log(`keyBytes${suffix}`, result.keyBytes);
    } else {
        console.log(`failureFinding${suffix}:`, true);
    }
}

crypto = require("crypto");

if (process.argv.length < 3) {
    console.log("Usage:");
    console.log("");
    console.log("    cipher-info.js algorithm");
    console.log("");
    console.log("Determines the key size and IV size for an algorithm.");
    process.exit();
}

algorithm = process.argv[2];
console.log("algorithm:", algorithm);
result = scan(0, 0, 1, 1, 2048, 2048);
show(result, "Min");
result = scan(4096, 4096, -1, -1, 0, 0);
show(result, "Max");
