"use strict";

module.exports = (binaryBuffer, thirtyTwo) => {
    /**
     * Decode data from Base32.
     *
     * @param {(Buffer|string)} data
     * @return {Buffer} decoded
     */
    function decode(data) {
        return thirtyTwo.decode(data);
    }


    /**
     * Decodes data that was encoded as Base32 for URIs.
     *
     * @param {string} data
     * @return {Buffer} decoded
     */
    function decodeForUri(data) {
        var copy;

        copy = data;

        if (copy.length % 8) {
            copy += "=======".substr(copy.length % 8 - 1);
        }

        return decode(copy);
    }


    /**
     * Encode data into Base32.
     *
     * @param {(Buffer|string)} data
     * @return {string} encoded
     */
    function encode(data) {
        // When passing data to this library, one must guarantee that the
        // data is NOT a string, otherwise an encoding like UTF-8 will be
        // assumed.
        data = binaryBuffer.toBuffer(data);

        return thirtyTwo.encode(data).toString("binary");
    }


    /**
     * Encodes data into Base32 intended for a URI. This replaces characters
     * which could cause issues reading the value in a URI.
     *
     * @param {(Buffer|string)} data
     * @return {string} encoded for URI
     */
    function encodeForUri(data) {
        var encodedData;

        encodedData = encode(data);
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
