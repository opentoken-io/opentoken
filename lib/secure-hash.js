/* eslint no-bitwise:0 */
"use strict";

/**
 * Handles the hashing of data in a secure fashion for use
 * where needed.
 */

/**
 * The configuration object for hashing sets up a personal
 * way of hashing data. Each parameter is optional,
 * but highly recommended.
 *
 * @typedef {Object} secureHash~config
 * @property {string} algorithm the algorithm to use in the digest
 * @property {string} hashLength how long the hashed string will be
 * @property {string} iterations
 * @property {string} salt should be rather lengthy
 */

module.exports = (base64, cryptoAsync) => {
    /**
     * Compares a hashed string to another hashed string
     * to see if they are the same. We loop through the
     * shortest one to see what compares to the longer one.
     *
     * We want to always loop through the data even if we know
     * the lengths are different. This helps to deter against
     * picosecond time attacks.
     *
     * @param {string} dataHashed
     * @param {string} compareTo
     * @return {boolean}
     */
    function compare(dataHashed, compareTo) {
        var differences, i, minLength;

        minLength = Math.min(dataHashed.length, compareTo.length);
        differences = dataHashed.length - compareTo.length;

        for (i = 0; i < minLength; i += 1) {
            differences += dataHashed[i] ^ compareTo[i];
        }

        return differences === 0;
    }


    /**
     * Hashes the content passed using defaults or
     * configuration options if passed in.
     *
     * @param {(Buffer|string)} data
     * @param {secureHash~config} [config]
     * @return {Promise.<Buffer>}
     */
    function pbkdf2Async(data, config) {
        var algorithm, hashLength, iterations, salt;

        if (!data) {
            throw new Error("Nothing to hash");
        }

        if (typeof data === "string") {
            data = new Buffer(data, "binary");
        }

        algorithm = config.algorithm;
        hashLength = config.hashLength;
        iterations = config.iterations;
        salt = new Buffer(config.salt || "", "binary");

        return cryptoAsync.pbkdf2Async(data, salt, iterations, hashLength, algorithm);
    }


    /**
     * Hash and encode as an ID, which means it's Base64 encoded and special
     * problematic characters are altered.
     *
     * @param {(Buffer|string)} data
     * @param {secureHash~config} [config]
     * @return {Promise.<string>}
     */
    function pbkdf2IdAsync(data, config) {
        return pbkdf2Async(data, config).then((result) => {
            return base64.encodeForUri(result);
        });
    }

    return {
        compare,
        pbkdf2Async,
        pbkdf2IdAsync
    };
};
