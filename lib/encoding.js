"use strict";

/**
 * Encodes data in any of the allowed methods.
 */

/**
 * @typedef {string} encoding~method
 * @see {@link ../schema/meta/encoding-method.json}
 */

module.exports = (base32, base64, hex) => {
    /**
     * Decodes data
     *
     * @param {string} data
     * @param {encoding~method} method
     * @return {Buffer} decoded
     * @throws {Error} invalid decoding method
     */
    function decode(data, method) {
        switch (method) {
        case "base32":
            return base32.decode(data);

        case "base32-uri":
            return base32.decodeForUri(data);

        case "base64":
            return base64.decode(data);

        case "base64-uri":
            return base64.decodeForUri(data);

        case "hex":
            return hex.decode(data);

        default:
            throw new Error(`Invalid decoding method: ${method}`);
        }
    }


    /**
     * Encodes data
     *
     * @param {(Buffer|string)} data
     * @param {encoding~method} method
     * @return {string} encoded
     * @throws {Error} invalid encoding method
     */
    function encode(data, method) {
        switch (method) {
        case "base32":
            return base32.encode(data);

        case "base32-uri":
            return base32.encodeForUri(data);

        case "base64":
            return base64.encode(data);

        case "base64-uri":
            return base64.encodeForUri(data);

        case "hex":
            return hex.encode(data);

        default:
            throw new Error(`Invalid encoding method: ${method}`);
        }
    }

    return {
        decode,
        encode
    };
};
