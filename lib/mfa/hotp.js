"use strict";

/**
 * Handles Multi Factor Authentication for accessing parts of the
 * application we want to verify the client has access to.
 *
 */
class HOTP {
    /**
     * We want to promisfy all methods we can because some of them
     * take some time to generate and we don't want code going on
     * till we have the data we need back.
     *
     * @param {Object} tfa
     * @param {Object} promise
     */
    constructor(twofa, promise) {
        this.twofa = promise.promisifyAll(twofa);
    }


    /**
     * Generates the secret key the client will need to enter to
     * initiate the two factor authentication.
     *
     * @return {Promise}
     */
    generateSecretAsync() {
        return this.twofa.generateKeyAsync(128);
    }


    /**
     * Returns the image for seeing a QR code and can be then loaded into a
     * browser or other application which can display the image.
     * This makes it easier for the client to set up on their device as
     * they can just scan the code.
     *
     * @param {string} secretKey
     * @param {string} email
     * @return {Promise.<string>}
     */
    generateQrCodeAsync(secretKey, email) {
        email = email ? email : "";

        return this.twofa.generateGoogleQRAsync("OpenToken IO", email, secretKey);
    }


    /**
     * Verifies the token passed in is valid using the key
     *
     * @param {string} secretKey
     * @param {string} toVerify token passed in from client
     * @param {number} beforeDrift the number of counters to check before what we're given
     * @return {boolean} whether the token is valid
     */
    verifyToken(secretKey, toVerify, beforeDrift) {
        var opts;

        opts = {
            beforeDrift: +(beforeDrift) || 0
        };

        return this.twofa.verifyTOTP(secretKey, toVerify, opts);
    }
}

module.exports = HOTP;