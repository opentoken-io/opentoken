"use strict";

module.exports = (binaryBuffer) => {
    /**
     * Decode data from Base64.
     *
     * @param {(Buffer|string)} data
     * @return {Buffer} decoded
     */
    function decode(data) {
        if (typeof data !== "string") {
            data = data.toString("binary");
        }

        return new Buffer(data, "base64");
    }


    /**
     * Decodes data that was encoded as Base64 for URIs.
     *
     * @param {string} data
     * @return {Buffer} decoded
     */
    function decodeForUri(data) {
        var copy;

        copy = data.replace(/-/g, "+").replace(/_/g, "/");

        if (copy.length % 4) {
            copy += "===".substr(copy.length % 4 - 1);
        }

        return decode(copy);
    }


    /**
     * Encode data into Base64.
     *
     * @param {(Buffer|string)} data
     * @return {string} encoded
     */
    function encode(data) {
        data = binaryBuffer.toBuffer(data);

        return data.toString("base64");
    }


    /**
     * Encodes data into Base64 intended for a URI. This replaces characters
     * which could cause issues reading the value in a URI.
     *
     * @param {(Buffer|string)} data
     * @return {string} encoded for URI
     */
    function encodeForUri(data) {
        var encodedData;

        encodedData = encode(data);
        encodedData = encodedData.replace(/\+/g, "-");
        encodedData = encodedData.replace(/\//g, "_");
        encodedData = encodedData.replace(/=/g, "");

        return encodedData;
    }

    return {
        decode,
        decodeForUri,
        encode,
        encodeForUri
    };
};
