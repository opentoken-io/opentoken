"use strict";

/**
 * Manages the business logic of account controls.
 */

/**
 * Information about an account holder.
 *
 * @typedef {Object} accountManager~accountFile
 * @property {string} email
 * @property {string} mfaKey
 * @property {string} secureHash
 * @property {string} passwordSalt
 */

/**
 *
 * @typedef {Object} accountManager~challengeSet
 * @property {string} salt
 * @property {string} algo
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
 * @property {accountManager~hashSet} pbkdf2
 */

/**
 * How to hash a password for registering and logging in.
 *
 * @typedef {Object} accountManager~hashSet
 * @property {string} algo
 * @property {string} bytes
 * @property {string} iterations
 * @property {string} saltLength
 */

/**
 * What an account holder needs in order to create the
 * password hash to attempt to log in.
 *
 * @typedef {Object} accountManager~loginInitiateClientInfo
 * @property {accountManager~hashSet} pbkdf2
 * @property {accountManager~challengeSet} challenge
 * @property {string} encoding
 * @property {Array} mfa
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
 * Lifetime for how long a file should last. This can
 * contain as many properties as needed to adjust the
 * time.
 *
 * @typedef {Object} accountManager~lifeTime
 * @property {string} hours, minutes, seconds
 *
 */

/**
 * Information the Account Holder sends to complete the
 * login process.
 *
 * @typedef {Object} accountManager~loginCompleteInfo
 * @property {string} password
 * @property {string} currentMfa
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

module.exports = function (accountService, base64, config, hotp, otDate, promise, random, secureHash) {
    var accountConfig, loginConfig;

    accountConfig = config.account;
    loginConfig = config.login;

    /**
     * Checks to see if the current mfa token is valid.
     *
     * @param {string} mfaKey
     * @param {string} currentMfa
     * @throws {Error} if not valid
     */
    function checkCurrentMfa(mfaKey, currentMfa) {
        if (! hotp.verifyToken(mfaKey, currentMfa)) {
            throw new Error("Current MFA Token did not validate");
        }
    }


    /**
     * Checks to see if the previous mfa token is valid.
     *
     * @param {string} mfaKey
     * @param {string} previousMfa
     * @throws {Error} if not valid
     */
    function checkPreviousMfa(mfaKey, previousMfa) {
        if (! hotp.verifyToken(mfaKey, previousMfa, 1)) {
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
     * @param {accountManager~lifeTime} lifeTime
     * @return {OtDate}
     */
    function keyExpiration(lifeTime) {
        return otDate.now().plus(lifeTime);
    }


    /**
     * Finishes logging in a user.
     *
     * @param {string} hashedAccountId
     * @param {string} loginId
     * @param {accountManager~loginCompleteInfo} loginInfo
     * @return {Promise.<*>}
     */
    function loginCompleteAsync(hashedAccountId, loginId, loginInfo) {
        return accountService.getLoginFileAsync(hashedAccountId, loginId).then((loginFile) => {
            if (! secureHash.compare(loginFile.secureHash, loginInfo.password)) {
                throw new Error("Password hashes do not match");
            }

            return accountService.getAccountFileAsync(loginFile.accountId).then((accountFile) => {
                checkCurrentMfa(accountFile.mfaKey, loginInfo.currentMfa);

                return accountService.deleteLoginFileAsync(hashedAccountId, loginFile.challengeId);
            });
        });
    }


    /**
     * Maps information we want from the service to return
     * to the account holder to continue the login process
     *
     * @param {accountManager~loginInitiateDetails} details
     * @param {string} salt
     * @return {accountManager~loginInitiateClientInfo}
     */
    function loginInitiateDetails(details, salt) {
        return accountService.getAccountFileAsync(details.accountId).then((accountFile) => {
            return {
                pbkdf2: accountFile.pbkdf2,
                challenge: {
                    salt: salt,
                    algo: loginConfig.challenge.algo
                },
                passwordSalt: accountFile.passwordSalt,
                encoding: "base64",
                mfa: [
                    "hotp"
                ]
            };
        });
    }


    /**
     * Initiates the login process by creating the challenge id
     * and a salt used for logging in.
     *
     * @param {accountManager~loginInitateInfo} loginInitiateInfo
     * @return {accountManager~loginInitateDetails}
     * @throws {Error} When account hashes do not match
     */
    function loginInitiationAsync(hashedAccountId, loginInitiateInfo) {
        return secureHash.encodeUriAsync(loginInitiateInfo.accountId, accountConfig.idHash).then((accountIdHash) => {
            if (! secureHash.compare(accountIdHash, hashedAccountId)) {
                throw new Error("Account hashes do not match");
            }

            return promise.props({
                loginId: random.randomIdAsync(loginConfig.loginIdLength),
                salt: random.randomIdAsync(loginConfig.challenge.saltLength)
            }).then((bits) => {
                return accountService.hashPasswordAsync(loginInitiateInfo.accountId, bits.salt).then((secureHash) => {
                    var loginFile, options;

                    loginFile = {
                        accountId: loginInitiateInfo.accountId,
                        loginId: bits.loginId,
                        secureHash: secureHash
                    };
                    options = {
                        expires: keyExpiration(loginConfig.loginLifetime)
                    };

                    return accountService.putLoginFileAsync(loginFile, hashedAccountId, options).then(() => {
                        return loginInitiateDetails(loginFile, bits.salt);
                    });
                });
            });
        });
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
        accountInfo.pbkdf2 = accountConfig.secureHash;
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
            checkCurrentMfa(accountFile.mfaKey, registrationInfo.currentMfa);
            checkPreviousMfa(accountFile.mfaKey, registrationInfo.previousMfa);

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
                mfaKey: accountFile.mfaKey,
                pbkdf2: accountConfig.secureHash,
                passwordSalt: accountFile.passwordSalt,
                encoding: "base64",
                mfa: [
                    "hotp"
                ]
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