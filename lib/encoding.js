"use strict";

/**
 * Encodes data in any of the allowed methods.
 */

/**
 * @typedef {string} encoding~method
 * @see {@link ../schema/meta/encoding-method.json}
 */

module.exports = (base64) => {
    /**
     * Decodes data
     *
     * @param {string} data
     * @param {encoding~method} method
     * @return {string} decoded
     * @throws {Error} invalid encoding method
     */
    function decode(data, method) {
        switch (method) {
        case "base64":
            return base64.decode(data);

        case "base64-uri":
            return base64.decodeForUri(data);

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
        case "base64":
            return base64.encode(data).toString("binary");

        case "base64-uri":
            return base64.encodeForUri(data).toString("binary");

        default:
            throw new Error(`Invalid encoding method: ${method}`);
        }
    }

    return {
        decode,
        encode
    };
};
