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

module.exports = function (accountService, config, hotp, otDate, promise, random, secureHash) {
    var accountConfig;

    accountConfig = config.account || {};

    /**
     * Checks to see if the values for MFA are valid and will
     * throw if they are not.
     *
     * @param {string} mfaKey
     * @param {string} currentMfa
     * @param {string} previousMfa
     * @throws {Error}
     */
    function checkMfa(mfaKey, currentMfa, previousMfa) {
        if (! hotp.verifyToken(mfaKey, currentMfa)) {
            throw new Error("Current MFA Token did not validate");
        }

        if (previousMfa && ! hotp.verifyToken(mfaKey, previousMfa, 1)) {
            throw new Error("Previous MFA Token did not validate");
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
     * Creates the object for key expiration option. We need to be
     * specific that we are expiring a file after a given time.
     *
     * @param {Object} lifeTime
     * @return {s3~putOptions}
     * @throws {Error} if we don't pass in something or it's not an object
     */
    function keyExpiration(lifeTime) {
        if (!lifeTime) {
            throw new Error("Lifetime for key was not found");
        }

        return otDate.now().plus(lifeTime);
    }


    /**
     * Finishes logging in a user
     *
     * @param {Object} loginInfo
     */
    function loginCompleteAsync(loginInfo) {
        return accountService.getAccountFileAsync(loginInfo.accountId).then((accountFile) => {
            return loginVerifyAsync(accountFile, loginInfo);
        });
    }


    /**
     *
     *
     * TODO: Make checkMfa take previous as a optional parameter
     */
    function loginVerifyAsync(accountFile, loginInfo) {
        checkMfa(accountFile.mfaKey, loginInfo.currentMfa);

        // TODO: Hash Password as the client would have
        var hashedPassword;

        hashedPassword = "afsldjf3r3jofjaso3jrojfsdFASDf383jfafasfa23fafaSdfAsdFAs";

        if (secureHash.compare(loginInfo.password, hashedPassword)) {
            return accountService.deleteChallengeAsync(loginInfo.accountId, loginInfo.challenge);
        } else {
            return false;
        }
    }


    /**
     * Maps information we want from the service to return
     * to the account holder to continue the login process
     *
     * @param {Object} details
     * @return {accountManager~loginInitateDetails}
     */
    function loginInitiateDetails(details) {
        return {
            challengeId: details.challengeId,
            salt: details.salt
        };
    }


    /**
     * Initiates the login process by creating the challenge id
     * and another salt...
     *
     * @param {accountManager~loginInitateInfo} loginInitiateInfo
     * @return {accountManager~loginInitateDetails}
     */
    function loginInitiationAsync(loginInitiateInfo) {
        return promise.props({
            challengeId: random.randomIdAsync(accountConfig.challengeIdLength),
            salt: random.randomIdAsync(accountConfig.passwordSaltLength)
        }).then((bits) => {
            var challengeFile, options;

            // What is saved
            challengeFile = {
                accountId: loginInitiateInfo.accountId,
                salt: bits.salt
            };
            options = {
                expires: keyExpiration(accountConfig.challengeLifetime)
            };

            return accountService.putChallengeAsync(challengeFile, loginInitiateInfo.accountId, bits.challengeId, options).then(() => {
                return bits;
            });
        }).then(loginInitiateDetails);
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
            expires: keyExpiration(accountConfig.completeLifetime)
        };

        return accountService.completeAsync(accountInfo, options, regId).then(completeDetails);
    }


    /**
     * Validates the previous and current MFA values are valid and sends
     * data off to the account service for updating/putting data into
     * the account record.
     *
     * @param {accountManager~registrationInfo} accountInfo
     * @return {Promise.<accountManager~completionInfo>}
     */
    function signupCompleteAsync(registrationInfo) {
        return accountService.getRegistrationFileAsync(registrationInfo.regId).then((accountFile) => {
            checkMfa(accountFile.mfaKey, registrationInfo.currentMfa, registrationInfo.previousMfa);

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
                expires: keyExpiration(accountConfig.initiateLifetime)
            };

            return accountService.signupInitiateAsync(accountFile, options, bits.regId);
        }).then(registrationDetails);
    }

    return {
        loginInitiationAsync: loginInitiationAsync,
        loginCompleteAsync: loginCompleteAsync,
        signupCompleteAsync: signupCompleteAsync,
        signupConfirmAsync: signupConfirmAsync,
        signupInitiationAsync: signupInitiationAsync
    };
};