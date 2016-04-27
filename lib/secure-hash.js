"use strict";

module.exports = function (config, crypto) {
    /**
     * Hashes the content passed, but if no content was passed
     * just return false as there's nothing to do.
     *
     * @param {string} content
     * @return {string}
     */
    function hashContent(content) {
        if (! content) {
            throw new Error("Nothing to hash");
        }

        return crypto.createHash(config.secureHash.hashAlgo).update(content).digest("base64").replace(/\+/g, "-").replace(/\//g, "_");
    }

    return {
        hashContent: hashContent
    };
};
