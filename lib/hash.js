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
 * @typedef {Object} hash~deriveConfig
 * @property {string} algorithm the algorithm to use in the digest
 * @property {string} derivedLength how long the hashed string will be
 * @property {string} encoding The encoding method
 * @property {string} iterations
 * @property {string} [salt] should be rather lengthy
 * @property {string} type How the data should be hashed
 */

/**
 * A much simpler hash config for less critical things.
 *
 * @typedef {Object] hash~hashConfig
 * @property {string} algorithm Digest algorithm name
 * @property {string} encoding The encoding method
 * @property {string} [salt] Used after the data to "salt" it
 */

module.exports = (cryptoAsync, encoding, promise) => {
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
     * @param {hash~deriveConfig} config
     * @return {Promise.<Buffer>}
     */
    function pbkdf2Async(data, config) {
        var salt;

        if (typeof data === "string") {
            data = new Buffer(data, "binary");
        }

        salt = new Buffer(config.salt || "", "binary");

        return cryptoAsync.pbkdf2Async(data, salt, config.iterations, config.derivedLength, config.algorithm);
    }


    /**
     * Hash derivation.  "Strengthen" hashes by repeating the hash process
     * using a known algorithm.  Calls out to the right method as needed.
     *
     * @param {(Buffer|string)} data
     * @param {hash~deriveConfig} config
     * @return {Promise.<string>}
     */
    function deriveAsync(data, config) {
        var result;

        if (!data.length) {
            return promise.reject(new Error("Nothing to hash"));
        }

        switch (config.type) {
        case "pbkdf2":
            result = pbkdf2Async(data, config);
            break;

        default:
            return promise.reject(new Error("Invalid hash type configuration"));
        }

        result = result.then((hash) => {
            return encoding.encode(hash, config.encoding);
        });

        return result;
    }


    return {
        compare,
        deriveAsync
    };
};
