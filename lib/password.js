"use strict";


module.exports = function(crypto) {

    /**
     * Hashes the content passed, but if no content was passed
     * just return false as there's nothing to do.
     *
     * @param {string} content
     * @return {(string|boolean})
     */
    function hashContent(content) {
        if (! content) {
            return false;
        }

        return crypto.createHash("sha256").update(content).digest("base64");
    }

    return {
        hashContent: hashContent
    };
};
