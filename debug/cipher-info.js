#!/usr/bin/env node
"use strict";

var algorithm, crypto, result;

function attempt(keyLen, ivLen) {
    var iv, key;

    key = new Buffer(keyLen);
    iv = new Buffer(ivLen);
    crypto.createCipheriv(algorithm, key, iv);
}

function scan(startKey, startIv, modKey, modIv, endKey, endIv) {
    var cont, ivBytes, keyBytes;

    keyBytes = startKey;
    ivBytes = startIv;
    cont = true;

    while (cont) {
        try {
            attempt(keyBytes, ivBytes);

            return {
                keyBytes: keyBytes,
                ivBytes: ivBytes
            };
        } catch (e) {
            if (e.toString().indexOf("Invalid IV length") >= 0) {
                if (ivBytes == endIv) {
                    console.error("Missed the IV");

                    return null;
                }

                ivBytes += modIv;
            } else if (e.toString().indexOf("Invalid key length") >= 0) {
                if (keyBytes == endKey) {
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
}

function show(result, suffix) {
    if (! result) {
        console.log("failureFinding" + suffix + ":", true);
    } else {
        console.log("ivBytes" + suffix + ":", result.ivBytes);
        console.log("keyBytes" + suffix + ":", result.keyBytes);
    }
}

crypto = require("crypto");

if (process.argv.length < 3) {
    console.log("Usage:")
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
