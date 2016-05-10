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
 * @property {string} password
 * @property {string} passwordSalt
 */

/**
 *
 * @typedef {Object} accountManager~challengeSet
 * @property {string} salt
 * @property {string} hash
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
 * @property {accountManager~hashSet} passwordHashing
 */

/**
 * How to hash a password for registering and logging in.
 *
 * @typedef {Object} accountManager~hashSet
 * @property {string} algo
 * @property {string} hashLength
 * @property {string} iterations
 * @property {string} salt
 */

/**
 * What an account holder needs to create the password hash
 * to attempt to log in.
 *
 * @typedef {Object} accountManager~loginInitiateClientInfo
 * @property {accountManager~hashSet} pbkdf
 * @property {accountManager~challengeSet} challenge
 * @property {string} encoding
 *
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
 * @property {string} Hours, Minutes, Seconds
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
    var accountConfig;

    accountConfig = config.account || {};

    /**
     * Checks to see if the values for MFA are valid and will
     * throw if they are not.
     *
     * @param {string} mfaKey
     * @param {string} currentMfa
     * @param {string} [previousMfa]
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
     * Creates a password hash using the same method
     * an account holder used to create a password to login.
     *
     * @param {string} password
     * @param {string} salt
     * @return {Promise.<string>}
     */
    function hashPasswordAsync(accountFile, salt) {
        return secureHash.hashAsync(accountFile.password + salt, accountConfig.passwordHash.secondary, true).then((hashedPassword) => {
            return secureHash.simpleHash(hashedPassword, accountConfig.loginHash);
        });
    }


    /**
     * Creates the object for key expiration option. We need to be
     * specific that we are expiring a file after a given time.
     *
     * @param {accountManager~lifeTime} lifeTime
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
     * Finishes logging in a user.
     *
     * @param {string} hashedAccountId
     * @param {string} loginId
     * @param {accountManager~loginCompleteInfo} loginInfo
     * @return {Promise.<*>}
     */
    function loginCompleteAsync(hashedAccountId, loginId, loginInfo) {
        return accountService.getLoginFileAsync(hashedAccountId, loginId).then((loginFile) => {
            return accountService.getAccountFileAsync(loginFile.accountId).then((accountFile) => {
                return loginVerifyAsync(accountFile, loginFile.salt, loginInfo.password);
            }).then(() => {
                checkMfa(loginFile.mfaKey, loginInfo.currentMfa);

                return accountService.deleteLoginFileAsync(hashedAccountId, loginFile.challengeId);
            });
        });
    }


    /**
     * Need to verify the password we have on file matches
     * what the account holder is using to log in.
     *
     * @param {accoutManager~accountFile} accountFile
     * @param {string} salt
     * @param {string} hashedPassword
     * @return {boolean}
     * @throws {Error} If the password hashes do not match
     */
    function loginVerifyAsync(accountFile, salt, hashedPassword) {
        return hashPasswordAsync(accountFile, salt).then((passwordHash) => {
            if (! secureHash.compare(passwordHash, base64.encode(hashedPassword))) {
                throw new Error("Password hashes do not match");
            }

            return true;
        });
    }


    /**
     * Maps information we want from the service to return
     * to the account holder to continue the login process
     *
     * @param {accountManager~loginInitiateDetails} details
     * @return {accountManager~loginInitiateClientInfo}
     */
    function loginInitiateDetails(details) {
        return accountService.getAccountFileAsync(details.accountId).then((accountFile) => {
            return random.randomIdAsync(config.account.passwordSaltLength).then((passwordSaltId) => {
                var passwordHash;

                passwordHash = accountConfig.passwordHash;
                passwordHash.salt = accountFile.passwordSalt;

                return {
                    pbkdf: passwordHash,
                    challenge: {
                        salt: details.salt,
                        hash: accountConfig.loginHash
                    },
                    encoding: "base64"
                };
            });
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
        return secureHash.hashAsync(loginInitiateInfo.accountId, accountConfig.idHash).then((accountIdHash) => {

            if (! secureHash.compare(accountIdHash, hashedAccountId)) {
                throw new Error("Account hashes do not match");
            }

            return promise.props({
                challengeId: random.randomIdAsync(accountConfig.loginIdLength),
                salt: random.randomIdAsync(accountConfig.passwordSaltLength)
            }).then((bits) => {
                var loginFile, options;

                loginFile = {
                    accountId: loginInitiateInfo.accountId,
                    challengeId: bits.challengeId,
                    salt: bits.salt
                };
                options = {
                    expires: keyExpiration(accountConfig.loginLifetime)
                };

                return accountService.putLoginFileAsync(loginFile, hashedAccountId, options).then(() => {
                    return loginFile;
                });

            }).then(loginInitiateDetails);
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
        accountInfo.password = base64.decode(registrationInfo.password);
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
            var passwordHash;

            passwordHash = accountConfig.passwordHash;
            passwordHash.salt = accountFile.passwordSalt;

            return {
                mfaKey: accountFile.mfaKey,
                pbkdf: passwordHash,
                encoding: "base64"
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