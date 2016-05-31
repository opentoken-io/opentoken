"use strict";

/**
 * Handles Multi Factor Authentication.
 *
 * We want to promisfy all methods we can because some of them
 * are asynchronous.
 *
 * @param {Object} config
 * @param {Object} twofaAsync
 * @return {Function} factory
 */
module.exports = function (config, twofaAsync) {
    var applicationName, keyLength;

    /**
     * Generates the secret key the client will need to enter to
     * initiate the two factor authentication.
     *
     * @return {Promise.<string>}
     */
    function generateSecretAsync() {
        return twofaAsync.generateKeyAsync(keyLength);
    }


    /**
     * Returns the image for seeing a QR code and can be then loaded into a
     * browser or other application which can display the image.
     * This makes it easier for the client to set up on their device as
     * they can just scan the code.
     *
     * @param {string} secretKey
     * @param {string} email
     * @return {Promise.<Buffer>} PNG image
     */
    function generateQrCodeAsync(secretKey, email) {
        return twofaAsync.generateGoogleQRAsync(applicationName, email, secretKey, {
            encoding: "buffer"
        });
    }


    /**
     * Verifies a code is currently valid.
     *
     * @param {string} secretKey
     * @param {string} current The current code from the client
     * @return {boolean} true if the code is valid
     */
    function verifyCurrent(secretKey, current) {
        return twofaAsync.verifyTOTP(secretKey, current);
    }


    /**
     * Verifies two codes, current and previous, and ensures they are right.
     *
     * @param {string} secretKey
     * @param {string} current
     * @param {string} previous
     * @return {boolean} true if the codes are both valid
     */
    function verifyCurrentAndPrevious(secretKey, current, previous) {
        if (twofaAsync.verifyTOTP(secretKey, current)) {
            return twofaAsync.verifyTOTP(secretKey, previous, {
                beforeDrift: 1
            });
        }

        return false;
    }

    applicationName = config.mfa.totp.name;
    keyLength = config.mfa.totp.keyLength;

    return {
        generateSecretAsync,
        generateQrCodeAsync,
        verifyCurrent,
        verifyCurrentAndPrevious
    };
};
