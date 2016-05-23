"use strict";

/**
 * Handles Multi Factor Authentication for accessing parts of the
 * application we want to verify the client has access to.
 *
 * We want to promisfy all methods we can because some of them
 * take some time to generate and we don't want code going on
 * till we have the data we need back.
 *
 * @param {Object} config
 * @param {Object} twofa
 * @param {Object} promise
 * @return {Function} factory
 */
module.exports = function (config, twofa, promise) {
    var twofaLocal;

    twofaLocal = promise.promisifyAll(twofa);

    /**
     * Generates the secret key the client will need to enter to
     * initiate the two factor authentication.
     *
     * @return {Promise.<string>}
     */
    function generateSecretAsync() {
        var keySize;

        if (config.hotp && config.hotp.keySize) {
            keySize = +config.hotp.keySize;
        }

        return twofaLocal.generateKeyAsync(keySize || 128);
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
    function generateQrCodeAsync(secretKey, email) {
        var applicationName;

        if (config.hotp && config.hotp.name) {
            applicationName = config.hotp.name;
        }

        return twofaLocal.generateGoogleQRAsync(applicationName || "OpenToken.io", email || "", secretKey);
    }


    /**
     * Verifies the token passed in is valid using the key
     *
     * @param {string} secretKey
     * @param {string} toVerify token passed in from client
     * @param {number} beforeDrift the number of counters to check before what we're given
     * @return {boolean} whether the token is valid
     */
    function verifyToken(secretKey, toVerify, beforeDrift) {
        var opts;

        opts = {
            beforeDrift: +beforeDrift || 0
        };

        return twofaLocal.verifyTOTP(secretKey, toVerify, opts);
    }

    return {
        generateSecretAsync,
        generateQrCodeAsync,
        verifyToken
    };
};
