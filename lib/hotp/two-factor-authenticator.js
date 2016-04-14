"use strict";

// Will need to take some options.
// For signup we need the current and previous
// So we'll need to be able to say we want to allow the previous one
// and then the current one.
// TODO: rename to hotp

class TwoFactorAutenticator {
    constructor(tfa, promise) {
        this.tfa = promise.promisifyAll(tfa);
    }


    /**
     * Generates the secret key the client will need to enter to
     * initiate the two factor authentication
     */
    generateSecret() {
        return this.tfa.generateKeyAsync(128);
    }


    /**
     * Verifies the token passed in is valid.
     *
     * @param {string} secretKey
     * @param {string} toVerify token passed in from client
     * @return {boolean} whether the token validates
     */
    verifyToken(secretKey, toVerify) {
        if (! this.key || ! toVerify) {
            return false;
        }

        var opts = {
            // the number of counters to check before what we're given
            // default: 0
            beforeDrift: 1,
            // and the number to check after
            // default: 0
            afterDrift: 1,
            // if before and after drift aren't specified,
            // before + after drift are set to drift / 2
            // default: 0
            drift: 0,
            // the step for the TOTP counter in seconds
            // default: 30
            step: 30
        };

        return this.tfa.verifyTOTP(secretKey, toVerify, opts);
    }
}

module.exports = TwoFactorAutenticator;