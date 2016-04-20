"use strict";


module.exports = function(crypto) {

    /**
     * Hashes the content.
     *
     * @param {string} toHash
     */
    function hashContent(content) {
        return crypto.createHashAysc("sha256").update(content).digest("base64");
    }

    return {
        hashContent: hashContent
    };
};
