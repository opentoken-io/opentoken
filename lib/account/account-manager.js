"use strict";

/**
 * Manages the business logic of account controls.
 */

/**
 * Information an account holder will need to
 * use the service.
 *
 * @typedef {Object} accountManager~completedInfo
 * @property {string} accountId Unhashed account id generated
 */

/**
 * Information for a user to generate their password
 * and validate the account.
 *
 * @typedef {Object} accountManager~confirmedInfo
 * @property {string} mfaKey
 * @property {string} passwordSalt
 */

/**
 * Information for a user to continue signing up.
 *
 * @typedef {Object} accountManager~initiatedInfo
 * @property {string} regId Unhashed registration id generated
 */

/**
 * Information for initiating an account signup.
 *
 * @typedef {Object} accountManager~initiationInfo
 * @property {string} email
 */

/**
 * Information to validate two factor authentication is set up
 * and password has been generated.
 *
 * @typedef {Object} accountManager~registrationInfo
 * @property {string} currentMfa
 * @property {string} password
 * @property {string} previousMfa
 * @property {string} regId Unhashed registration id sent to client
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
        if (!hotp.verifyToken(mfaKey, previousMfa, 1)) {
            throw new Error("Previous MFA Token did not validate");
        }

        if (!hotp.verifyToken(mfaKey, currentMfa)) {
            throw new Error("Current MFA Token did not validate");
        }
    }


    /**
     * Maps the information we specifically want from the
     * service to what we want to return to the account holder
     * for continued use of the system.
     *
     * @param {accountManager~completedInfo} details
     * @return {accountManager~completedInfo}
     */
    function completeDetails(details) {
        return {
            accountId: details.accountId
        };
    }


    /**
     * Maps the information we specifically want from the
     * service to what we want to return to the account holder
     * for registration.
     *
     * @param {accountManager~initiatedInfo} details
     * @return {accountManager~initiatedInfo}
     */
    function registrationDetails(details) {
        return {
            regId: details.regId
        };
    }


    /**
     * Finishes setting up the account and calls the Account Service
     * to save an account file with the requested information.
     *
     * @param {string} accountId
     * @param {accountManager~registrationInfo} registrationInfo
     * @return {Promise.<accountManager~completionInfo>}
     */
    function setupAccountAsync(accountId, registrationInfo) {
        var accountInfo, options, regId;

        accountInfo = {};
        accountInfo.accountId = accountId;
        accountInfo.password = registrationInfo.password;
        regId = registrationInfo.regId;
        options = {
            expires: otDate.now().plus(config.account.completeLifetime)
        };

        return accountService.completeAsync(accountInfo, options, regId).then(completeDetails);
    }


    /**
     * Validates the previous and current MFA values are valid and sends
     * data off to the account service for updating/putting data into
     * the account record.
     *
     * @param {accountManager~registrationInfo} registrationInfo
     * @return {Promise.<accountManager~completionInfo>}
     */
    function signupCompleteAsync(registrationInfo) {
        return accountService.getRegistrationFileAsync(registrationInfo.regId).then((accountFile) => {
            checkMfa(accountFile.mfaKey, registrationInfo.previousMfa, registrationInfo.currentMfa);

            return random.randomIdAsync(config.account.accountIdLength);
        }).then((accountId) => {
            return setupAccountAsync(accountId, registrationInfo);
        });
    }


    /**
     * Gets the account file from the registration id passed in
     * so the account holder can finish signing up.
     *
     * @param {string} regId
     * @return {Promise.<accountManager~confirmedInfo>}
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
     * @param {accountManager~initiationInfo} initiationInfo
     * @return {Promise.<accountManager~completionInfo>}
     */
    function signupInitiationAsync(initiationInfo) {
        return promise.props({
            mfaKey: hotp.generateSecretAsync(),
            regId: random.randomIdAsync(config.account.registrationIdLength),
            passwordSalt: random.randomIdAsync(config.account.passwordSaltLength)
        }).then((bits) => {
            var accountFile, options;

            accountFile = {
                email: initiationInfo.email,
                mfaKey: bits.mfaKey,
                passwordSalt: bits.passwordSalt
            };
            options = {
                expires: otDate.now().plus(config.account.initiateLifetime)
            };

            return accountService.signupInitiateAsync(accountFile, options, bits.regId);
        }).then(registrationDetails);
    }

    return {
        signupCompleteAsync,
        signupConfirmAsync,
        signupInitiationAsync
    };
};
