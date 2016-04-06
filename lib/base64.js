"use strict";

/**
 * Encode data into Base64.  When provided a string, returns a string.
 * When given a Buffer, returns a buffer.
 *
 * @param {Buffer|string} data
 * @return {Buffer|string} encoded
 */
function base64Encode(data) {
    if (typeof data === "string") {
        return (new Buffer(data, "binary")).toString("base64");
    }

    return new Buffer(data.toString("base64"));
}

/**
 * Decode data from Base64.  When provided a string, returns a string.
 * When given a Buffer, returns a buffer.
 *
 * @param {Buffer|string} data
 * @return {Buffer|string} decoded
 */
function base64Decode(data) {
    if (typeof data === "string") {
        return (new Buffer(data, "base64")).toString("binary");
    }

    return new Buffer(data.toString("binary"), "base64");
}

module.exports = {
    decode: base64Decode,
    encode: base64Encode
};
