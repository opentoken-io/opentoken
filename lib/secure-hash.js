"use strict";
/**
 * The configuration object for hashing sets up a personal
 * way of hashing data. Each parameter is optional,
 * but highly recommended.
 *
 * @typedef {Object} secureHash~config
 * @property {string} algo the algorithm to use in the digest
 * @property {string} hashLength how long the hashed string will be
 * @property {string} iterations
 * @property {string} salt should be rather lengthy
 */

/**
 * Handles the hashing of data in a secure fashion for use
 * where needed.
 */
module.exports = function (base64, crypto, promise) {
    crypto.pbkdf2Async = promise.promisify(crypto.pbkdf2);

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
    function secureHashCompare(dataHashed, compareTo) {
        var differences, i, minLength;

        minLength = Math.min(dataHashed.length, compareTo.length);
        differences = dataHashed.length - compareTo.length;

        for (i = 0; i < minLength; i += 1) {
            differences += dataHashed[i] ^ compareTo[i];
        }

        return differences == 0;
    }


    /**
     * Hashes the content passed using defaults or
     * configuration options if passed in.
     *
     * @param {(Buffer|string)} data
     * @param {secureHash~config} [config]
     * @return {Promise.<string>}
     */
    function secureHashAsync(data, config, regularEncode) {
        var algorithm, hashLength, iterations, salt;

        if (! data) {
            throw new Error("Nothing to hash");
        }

        if (typeof data === "string") {
            data = new Buffer(data, "binary");
        }

        config = config || {};
        algorithm = config.algo || "sha512";
        hashLength = config.hashLength || 48;
        iterations = config.iterations || 10000;
        salt = new Buffer(config.salt || "", "binary");

        return crypto.pbkdf2Async(data, salt, iterations, hashLength, algorithm).then((result) => {
            if (regularEncode) {
                return base64.encode(result).toString("binary");
            }

            return base64.encodeForUri(result);
        });
    }


    /**
     * Hashes data using an algorithm passed in.
     *
     * @param {string} data
     * @param {string} algorithm
     * @return {Promise.<string>}
     */
    function secureHashSimpleHash(data, algorithm) {
        return crypto.createHash(algorithm).update(data).digest("base64");
    }

    return {
        compare: secureHashCompare,
        hashAsync: secureHashAsync,
        simpleHashAsync: secureHashSimpleHash
    };
};
