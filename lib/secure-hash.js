"use strict";

module.exports = function (base64, crypto, promise) {
    crypto = promise.promisifyAll(crypto);

    /**
     * Hashes the content passed using defaults or
     * configuration options if they were passed in.
     *
     * @param {string} data
     * @param {Object} config
     * @return {Promise.<Buffer>}
     */
    function secureHashAsync(data, config) {
        var algorithm, hashLength, iterations, salt;

        if (! data) {
            throw new Error("Nothing to hash");
        }

        config = config ? config : {};
        algorithm = config.algo || "sha512";
        hashLength = config.hashLength || 512;
        iterations = config.iterations || 10000;
        salt = config.salt || "Ucg4TTL1N7tt6GMw3W3wULgaf4lALKHOuM4SBnh0FocOr3ccLH9eXLneoDDOrMVZ";

        return crypto.pbkdf2Async(data, salt, iterations, hashLength, algorithm).then((result) => {
            return base64.encodeForUri(result);
        });
    }

    return {
        hashAsync: secureHashAsync
    };
};
