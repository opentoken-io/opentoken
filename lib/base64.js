"use strict";

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
 * Encodes data into Base64 intended for a URI. This replaces characters
 * which could cause issues reading the value in a URI.
 *
 * @param {(Buffer|string)} data
 * @return {string} encoded for URI
 */
function base64EncodeForUri(data) {
    var encodedData;

    if (typeof data === "string") {
        encodedData = base64Encode(data);
    } else {
        encodedData = base64Encode(data).toString("binary");
    }

    return encodedData.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");
}

module.exports = {
    decode: base64Decode,
    encode: base64Encode,
    encodeForUri: base64EncodeForUri
};
