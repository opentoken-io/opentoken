"use strict";

/**
 * Handles Multi Factor Authentication.
 *
 * We want to promisfy all methods we can because some of them
 * are asynchronous.
 */

module.exports = function (config, random, twofaAsync) {
    var applicationName, keyLength;

    /**
     * Generates the secret key the client will need to enter to
     * initiate the two factor authentication.
     *
     * Does not fall through to 2fa's method because that generates
     * a base36 secret and we want a base256 secret.
     *
     * @return {Promise.<Buffer>}
     */
    function generateSecretAsync() {
        return random.bufferAsync(keyLength);
    }


    /**
     * Returns the image for seeing a QR code and can be then loaded into a
     * browser or other application which can display the image.
     * This makes it easier for the client to set up on their device as
     * they can just scan the code.
     *
     * @param {Buffer} secretKey
     * @param {string} email
     * @return {Promise.<Buffer>} PNG image
     */
    function generateQrCodeAsync(secretKey, email) {
        return twofaAsync.generateGoogleQRAsync(applicationName, email, secretKey, {
            encoding: "buffer"
        });
    }


    /**
     * Return a formatted URL for the key
     *
     * @param {Buffer} secretKey
     * @param {string} email
     * @return {string}
     */
    function generateUrl(secretKey, email) {
        return twofaAsync.generateUrl(applicationName, email, secretKey);
    }


    /**
     * Verifies a code is currently valid.
     *
     * @param {Buffer} secretKey
     * @param {string} current The current code from the client
     * @return {boolean} true if the code is valid
     */
    function verifyCurrent(secretKey, current) {
        return twofaAsync.verifyTOTP(secretKey, current);
    }


    /**
     * Verifies two codes, current and previous, and ensures they are right.
     *
     * @param {Buffer} secretKey
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
        generateUrl,
        verifyCurrent,
        verifyCurrentAndPrevious
    };
};
