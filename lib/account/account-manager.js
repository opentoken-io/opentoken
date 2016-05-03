"use strict";

/**
 * Manages the business logic of account controls.
 */

/**
 * Contains information needed to validate the user has
 * properly set up their two factor authentication and
 * has generated a password.
 *
 * @typedef {Object} accountManager~accountinfo
 * @property {string} regId Unhashed registration id sent to client
 * @property {string} currentMfa
 * @property {string} previousMfa
 * @property {string} password
 */

/**
 * Information for a user to generate their password
 * and validate the account.
 *
 * @typedef {Object} accountManager~confirmInfo
 * @property {string} passwordSalt
 * @property {string} mfaKey
 */

/**
 * Contains the registration id needed for a user to
 * continue on with the sign up process.
 *
 * @typeDef {Object} accountManager~completionInfo
 * @property {string} accountId Unhased account id generated
 */

/**
 * Contains the accountId an account holder needs to
 * use the service.
 *
 * @typeDef {Object} accountManager~initiationInfo
 * @property {string} accountId Unhased account id generated
 */

/**
 * @param {Object} accoutService
 * @param {Object} config
 * @param {Object} hotp
 * @param {Object} otDate
 * @param {Object} random
 * @param {Object} promise
 * @return {Object} account manager object
 */
module.exports = function (accountService, config, hotp, otDate, promise, random) {
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
     * Finishes setting up the account and calls the Account Service
     * to save an account file with the requested information.
     *
     * @param {string} accountId
     * @param {Object} accountInfo
     * @return {Promise.<accountManager~completionInfo>}
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
     * data off to the account service for updating/putting data into
     * the account record.
     *
     * Password generation should follow this format:
     * hash(hash(password) + salt)
     *
     * @param {AccountManager~accountInfo} accountInfo
     * @return {Promise.<accountManager~completionInfo>}
     */
    function signupCompleteAsync(accountInfo) {
        return accountService.getRegistrationFileAsync(accountInfo.regId).then((accountFile) => {
            checkMfa(accountFile.mfaKey, accountInfo.previousMfa, accountInfo.currentMfa);

            return random.randomIdAsync(config.account.accountIdLength || 24);
        }).then((accountId) => {
            return setupAccountAsync(accountId, accountInfo);
        });
    }


    /**
     * Gets the account file from the registration id passed in
     * so the account holder can finished signing up.
     *
     * @param {string} regId
     * @return {Promise.<accountManger~confirmInfo>}
     */
    function signupConfirmAsync(regId) {
        return accountService.getRegistrationFileAsync(regId).then((accountFile) => {
            return {
                passwordSalt: accountFile.passwordSalt,
                mfaKey: accountFile.mfaKey
            };
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
     * @return {Promise.<accountManager~initiationInfo>}
     */
    function signupInitiationAsync(accountInfo) {
        return promise.props({
            mfaKey: hotp.generateSecretAsync(),
            regId: random.randomIdAsync(config.account.registrationIdLength || 24),
            passwordSalt: random.randomIdAsync(config.account.passwordSaltLength || 128)
        }).then((bits) => {
            var accountFile, options;

            accountFile = {
                email: accountInfo.email,
                mfaKey: bits.mfaKey,
                passwordSalt: bits.passwordSalt
            };

            options = {
                expires: otDate.now().plus(config.account.initiateLifetime)
            };

            return accountService.signupInitiateAsync(accountFile, options, bits.regId);
        });
    }

    return {
        signupCompleteAsync: signupCompleteAsync,
        signupConfirmAsync: signupConfirmAsync,
        signupInitiationAsync: signupInitiationAsync
    };
};