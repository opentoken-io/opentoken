"use strict";
/**
 * Manages the business logic of account controls.
 */

/**
 * The object sent in which has information needed to validate the user
 * has properly set up their two factor authentication and has generated
 * a password for use to save.
 *
 * @typedef {Account~accountinfo}
 * @param {string} accountId this is the unhashed account id sent to client
 * @param {string} currentMfa
 * @param {string} previousMfa
 * @param {string} password
 */
module.exports = function (accountService, config, hotp, otDate, random, promise) {
    /**
     * Checks to see if the values for MFA are valid and will
     * throw if they are not.
     *
     * @param {string} mfaKey
     * @param {string} previousMfa
     * @param {string} currentMfa
     * @throws {Error}
     */
    function checkMfa(mfaKey, previousMfa, currentMfa) {
        if (! hotp.verifyToken(mfaKey, previousMfa, 1)) {
            throw new Error("Previous MFA Token did not validate");
        }

        if (! hotp.verifyToken(mfaKey, currentMfa)) {
            throw new Error("Current MFA Token did not validate");
        }
    }


    /**
     *
     *
     *
     * @param {string} accountId
     * @param {Object} accountInfo
     * @return {Promise.<Object>}
     */
    function setupAccountAsync(accountId, accountInfo) {
        var options, regId;

        accountInfo.accountId = accountId;
        accountInfo.password = accountInfo.password;
        regId = accountInfo.regId;

        options = {
            expires: otDate.now().plus(config.account.completeLifetime)
        };

        return accountService.completeAsync(accountInfo, options, regId);
    }


    /**
     * Validates the previous and current MFA values are valid and sends
     * data off to Account service class for updating/putting data into
     * the Account record.
     *
     * Password generation should follow this format:
     * hash(hash(password) + salt)
     *
     * @param {AccountManager~accountInfo} accountInfo
     * @return {Promise.<AccountService~accountFile>}
     */
    function signupCompleteAsync(accountInfo) {
        return accountService.getRegistrationFileAsync(accountInfo.regId).then((accountFile) => {
            checkMfa(accountFile.mfaKey, accountInfo.previousMfa, accountInfo.currentMfa);

            return random.passwordAsync(24);
        }).then((accountId) => {
            return setupAccountAsync(accountId, accountInfo);
        });
    }


    /**
     * Initiates the account creation by creating
     * a registration file with initial data for an account
     * holder to confirm and complete the account signup with.
     *
     * TODO: Validate email before doing anything else
     *
     * @param {Object} accountInfo
     * @return {Promise.<accountService~initiateResult>}
     */
    function signupInitiationAsync(accountInfo) {
        return promise.props({
            mfaKey: hotp.generateSecretAsync(),
            regId: random.passwordAsync(24),
            salt: random.passwordAsync(128)
        }).then((bits) => {
            var options;

            bits.email = accountInfo.email;

            options = {
                expires: otDate.now().plus(config.account.initiateLifetime)
            };

            return accountService.signupInitiateAsync(bits, options);
        });
    }

    return {
        signupCompleteAsync: signupCompleteAsync,
        signupInitiationAsync: signupInitiationAsync
    };
};