"use strict";

module.exports = function (base64, crypto, promise) {
    crypto.pbkdf2Async = promise.promisify(crypto.pbkdf2);

    /**
     * Hashes the content passed using defaults or
     * configuration options if passed in.
     *
     * @param {(Buffer|string)} data
     * @param {Object} config
     * @return {Promise.<string>}
     */
    function secureHashAsync(data, config) {
        var algorithm, hashLength, iterations, salt;

        if (! data) {
            throw new Error("Nothing to hash");
        }

        if (typeof data === "string") {
            data = new Buffer(data, "binary");
        }

        config = config || {};
        algorithm = config.algo || "sha512";
        hashLength = config.hashLength || 512;
        iterations = config.iterations || 10000;
        salt = new Buffer(config.salt || "", "binary");

        return crypto.pbkdf2Async(data, salt, iterations, hashLength, algorithm).then((result) => {
            return base64.encodeForUri(result);
        });
    }

    return {
        hashAsync: secureHashAsync
    };
};
