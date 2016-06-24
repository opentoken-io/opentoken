"use strict";

module.exports = () => {
    /**
     * Decode data from Base64.  When provided a string, returns a string.
     * When given a Buffer, returns a Buffer.
     *
     * @param {(Buffer|string)} data
     * @return {(Buffer|string)} decoded
     */
    function decode(data) {
        if (typeof data === "string") {
            return (new Buffer(data, "base64")).toString("binary");
        }

        return new Buffer(data.toString("binary"), "base64");
    }


    /**
     * Decodes data that was encoded as Base64 for URIs.  Only deals with
     * strings.
     *
     * @param {string} data
     * @return {string} decoded
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
     * Encode data into Base64.  When provided a string, returns a string.
     * When given a Buffer, returns a buffer.
     *
     * @param {(Buffer|string)} data
     * @return {(Buffer|string)} encoded
     */
    function encode(data) {
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
    function encodeForUri(data) {
        var encodedData;

        if (typeof data === "string") {
            encodedData = encode(data);
        } else {
            encodedData = encode(data).toString("binary");
        }

        return encodedData.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }

    return {
        decode,
        decodeForUri,
        encode,
        encodeForUri
    };
};
