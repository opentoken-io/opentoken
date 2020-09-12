/* eslint no-bitwise:0 */
"use strict";

/**
 * Handles the hashing of data in a secure fashion for use
 * where needed.
 */

/**
 * How secure things are hashed, such as passwords and IDs.
 *
 * @typedef {Object} hash~deriveConfig
 * @property {string} algorithm Used in the the digest.
 * @property {string} derivedLength Desired bytes before encoding.
 * @property {string} encoding The encoding method.
 * @property {string} iterations How many times to rehash.
 * @property {string} [salt] Should be rather lengthy.
 * @property {string} type How the data should be hashed.
 */

/**
 * A much simpler hash config for less critical things.
 *
 * @typedef {Object} hash~hashConfig
 * @property {string} algorithm Digest algorithm name.
 * @property {string} encoding The encoding method.
 * @property {string} [salt] Used after the data to "salt" it.
 */

/**
 * Configuration for computing HMAC.
 *
 * @typedef {Object} hash~hmacConfig
 * @property {string} algorithm Digest algorithm name.
 * @property {string} encoding The encoding method.
 * @property {string} secret The secret shared between users of the algorithm.
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
            data = Buffer.from(data, "binary");
        }

        salt = Buffer.from(config.salt || "", "binary");

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

        if (!data || !data.length) {
            return promise.reject(new Error("Nothing to hash"));
        }

        switch (config.type) {
        case "pbkdf2":
            result = pbkdf2Async(data, config);
            break;

        default:
            return promise.reject(new Error("Invalid hash type configuration"));
        }

        result = result.then((hashedData) => {
            return encoding.encode(hashedData, config.encoding);
        });

        return result;
    }


    /**
     * A simple hash function that uses a different algorithm based on
     * the configuration.
     *
     * @param {(Buffer|string)} data
     * @param {hash~hashConfig} config
     * @return {Promise.<string>}
     */
    function hash(data, config) {
        var hashObj;

        // Step 1 - hash the data
        hashObj = cryptoAsync.createHash(config.algorithm);
        hashObj.update(data, "binary");

        // Step 2 - handle salts
        if (config.salt) {
            hashObj.update(config.salt, "binary");
        }

        // Step 3 - encode and return the hash
        return encoding.encode(hashObj.digest("binary"), config.encoding);
    }


    /**
     * Compute a secure checksum of data.
     *
     * @param {(Buffer|string)} data
     * @param {hash~hmacConfig} config
     * @return {Promise.<string>}
     */
    function hmac(data, config) {
        var hmacObj;

        hmacObj = cryptoAsync.createHmac(config.algorithm, config.secret);
        hmacObj.update(data, "binary");

        return encoding.encode(hmacObj.digest("binary"), config.encoding);
    }


    return {
        compare,
        deriveAsync,
        hash,
        hmac
    };
};
