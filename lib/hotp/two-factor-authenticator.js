"use strict";

/**
 * Handles Multi Factor Authentication for accessing parts of the
 * application we want to verify the client has access to.
 *
 */
class TwoFactorAutenticator {
    /**
     * We want to promisfy all methods we can because some of them
     * take some time to generate and we don't want code going on
     * till we have the data we need back.
     *
     * @param {Object} tfa
     * @param {Object} promise
     */
    constructor(tfa, promise) {
        this.tfa = promise.promisifyAll(tfa);
    }


    /**
     * Generates the secret key the client will need to enter to
     * initiate the two factor authentication.
     *
     * @return {Promise}
     */
    generateSecret() {
        return this.tfa.generateKeyAsync(128);
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
    generateQRCode(secretKey, email) {
        email = email ? email : "";

        return this.tfa.generateGoogleQRAsync("OpenToken IO", email, secretKey);
    }


    /**
     * Verifies the token passed in is valid using the key
     *
     * @param {string} secretKey
     * @param {string} toVerify token passed in from client
     * @param {Object} options
     * @return {Promise.<boolean>} whether the token validates
     */
    verifyToken(secretKey, toVerify, options) {
        var opts;

        options = options ? options : {};

        opts = {
            // the number of counters to check before what we're given
            // default: 0
            beforeDrift: options.beforeDrift || 0,
            // and the number to check after
            // default: 0
            afterDrift: options.afterDrift || 0,
            // if before and after drift aren't specified,
            // before + after drift are set to drift / 2
            // default: 0
            drift: options.drift || 0,
            // the step for the TOTP counter in seconds
            // default: 30
            step: 30
        };

        // Might not be the best way to do this, but can't seem to get it work otherwise.

        return this.tfa.verifyTOTP(secretKey, toVerify, opts)
    }
}

module.exports = TwoFactorAutenticator;