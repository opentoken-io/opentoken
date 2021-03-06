"use strict";

/**
 * Random data generation
 */

module.exports = (base64, cryptoAsync) => {
    return {
        /**
         * Returns a promise that resolves with a buffer of the specified
         * size filled with random bytes.
         *
         * @param {number} size
         * @return {Promise.<Buffer>}
         */
        bufferAsync: (size) => {
            return cryptoAsync.randomBytesAsync(size);
        },

        /**
         * Generates a random string fulfilling the size requirements.
         * Does this by generating sufficient random data, converting it
         * to Base64, then doing some string manipulation.
         *
         * @param {number} size Desired length of ID that is generated
         * @return {Promise.<string>}
         */
        idAsync: (size) => {
            var binarySize;

            binarySize = 3 * Math.ceil(size / 4);

            return cryptoAsync.randomBytesAsync(binarySize).then((binaryBuffer) => {
                var result;

                result = base64.encode(binaryBuffer).toString("ascii");
                result = result.substr(0, size);
                result = result.replace(/\+/g, "-").replace(/\//g, "_");

                return result;
            });
        }
    };
};
