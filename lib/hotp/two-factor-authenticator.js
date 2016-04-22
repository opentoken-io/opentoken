"use strict";

class TwoFactorAutenticator {
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
     * Returns the link for seeing a QR code
     *
     * @param {string} secretKey
     * @return {Promise.<string>}
     */
    generateQRCode(secretKey) {
        return this.tfa.generateGoogleQRAsync("OpenToken IO", "", secretKey);
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

        this.tfa.verifyTOTP(secretKey, toVerify, opts)
    }
}

module.exports = TwoFactorAutenticator;