"use strict";

/**
 * Random data generation
 *
 * This factory will generate random data for you.
 *
 * @param {Object} base64
 * @param {Object} crypto
 * @param {Object} promise
 * @return {Object}
 */
module.exports = (base64, crypto, promise) => {
    crypto.randomBytesAsync = promise.promisify(crypto.randomBytes);

    return {
        /**
         * Returns a promise that resolves with a buffer of the specified
         * size filled with random bytes.
         *
         * @param {number} size
         * @return {Promise.<Buffer>}
         */
        bufferAsync: (size) => {
            return crypto.randomBytesAsync(size);
        },

        /**
         * Generates a random string fulfilling the size requirements.
         * Does this by generating sufficient random data, converting it
         * to Base64, then doing some string manipulation.
         *
         * @param {number} size
         * @return {Promise.<string>}
         */
        randomIdAsync: (size) => {
            var binarySize;

            binarySize = 3 * Math.ceil(size / 4);

            return crypto.randomBytesAsync(binarySize).then((binaryBuffer) => {
                var result;

                result = base64.encode(binaryBuffer).toString("ascii");
                result = result.substr(0, size);
                result = result.replace(/\+/g, "-").replace(/\//g, "_");

                return result;
            });
        }
    };
};
