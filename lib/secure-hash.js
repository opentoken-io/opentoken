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
    function compare(dataHashed, compareTo) {
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
    function createSecureHashAsync(data, config) {
        var algorithm, bytes, iterations, salt;

        if (! data) {
            throw new Error("Nothing to hash");
        }

        if (typeof data === "string") {
            data = new Buffer(data, "binary");
        }

        config = config || {};
        algorithm = config.algo || "sha512";
        bytes = config.bytes || 48;
        iterations = config.iterations || 10000;
        salt = new Buffer(config.salt || "", "binary");

        return crypto.pbkdf2Async(data, salt, iterations, bytes, algorithm);
    }


    function secureHashEncodedAsync(data, config) {
        return createSecureHashAsync(data, config).then((hash) => {
            return base64.encode(hash).toString("binary");
        });
    }


    function secureHashEncodedUriAsync(data, config) {
        return createSecureHashAsync(data, config).then((hash) => {
            return base64.encodeForUri(hash);
        });
    }


    /**
     * Hashes data using an algorithm passed in.
     *
     * @param {string} data
     * @param {string} algorithm
     * @return {Promise.<string>}
     */
    function createHash(data, algorithm) {
        return crypto.createHash(algorithm).update(data).digest("base64");
    }

    return {
        compare: compare,
        createHash: createHash,
        secureHashEncodedAsync: secureHashEncodedAsync,
        secureHashEncodedUriAsync: secureHashEncodedUriAsync
    };
};
