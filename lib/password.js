"use strict";

class Password {
    constructor(base64, crypto) {
        this.base64 = base64;
        this.crypto = crypto;
    }


    /**
     * Generates a random string and encodes it to base64.
     * Need to replace + and / so our storage system and
     * Urls work as intended.
     *
     * @param {number} length
     * @param {Object} info
     */
    generate(length) {
        var encoded;

        encoded = this.base64.encode(this.crypto.randomBytes(length)).toString("ascii");

        return encoded.replace(/\+/g, "-").replace(/\//g, "_");
    }


    /**
     * Hashes the content.
     *
     * @param {string} toHash
     */
    hashContent(content) {
        return this.crypto.createHash("sha256").update(content).digest("base64");
    }
}

module.exports = Password;