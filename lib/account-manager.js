"use strict";

/**
 * This is where the business logic and accounts are handled.  No other
 * module should touch account records nor config relating to accounts.
 */

/**
 * @typedef {Object} accountManager~passwordHashConfig
 * @property {string} algorithm
 * @property {number} derivedLength
 * @property {string} encoding
 * @property {number} iterations
 * @property {string} salt
 * @property {string} type
 */

/**
 * The real record that's stored.
 *
 * @typedef {Object} accountManager~record
 * @property {string} email
 * @property {string} passwordHash
 * @property {accountManager~passwordHashConfig} passwordHashConfig
 * @property {Object} mfa
 * @property {Object} mfa.totp
 * @property {string} mfa.totp.key
 */

/**
 * The public version of what's stored, along with other data that may be
 * useful for routes.
 *
 * @typedef {Object} accountManager~recordResponse
 * @property {string} id
 * @property {string} login New login cookie
 * @property {Object} record
 * @property {challengeManager~challengeHashConfig} record.challengeHashConfig
 * @property {string} record.email
 * @property {accountManager~passwordHashConfig} record.passwordHashConfig
 */

/**
 * Information required for attempting a login.
 *
 * @typedef {Object} accountManager~loginHashConfigRequest
 * @property {configManager~challengeHashConfig} challengeHashConfig
 * @property {accountManager~passwordHashConfig} passwordHashConfig
 */

/**
 * A request for logging in.  Validates the challenge and the MFA.
 *
 * @typedef {Object} accountManager~loginRequest
 * @property {string} challengeHash
 * @see {@link ../../schema/account/login-request.json}
 */

/**
 * Successful logins return the session ID.  This must be provided as a cookie
 * in future requests.
 *
 * @typedef {Object} accountManager~loginResponse
 * @property {string} sessionId
 */

module.exports = (challengeManager, config, random, sessionManager, storageServiceFactory, totp, util) => {
    var accountIdLength, passwordHashConfigBase, passwordSaltLength, storageService;


    /**
     * Create a new account record
     *
     * @param {accountManager~record} recordData
     * @return {Promise.<string>} account ID
     */
    function createAsync(recordData) {
        return random.idAsync(accountIdLength).then((id) => {
            return storageService.putAsync(id, recordData, {
                email: recordData.email
            }).then(() => {
                return id;
            });
        });
    }


    /**
     * Verify the password and MFA.  If login is successful, return
     * information for the cookie.
     *
     * @param {string} accountId
     * @param {accountManager~loginRequest} loginRequest
     * @return {Promise.<accountManager~loginResponse>}
     */
    function loginAsync(accountId, loginRequest) {
        // Retrieve the account first before attempting to check anything
        // else.
        return storageService.getAsync(accountId).then((recordData) => {
            return challengeManager.validateAsync(accountId, recordData.passwordHash, loginRequest.challengeHash).then(() => {
                if (!totp.verifyCurrent(recordData.mfa.totp.key, loginRequest.mfa.totp)) {
                    throw new Error("MFA TOTP did not validate");
                }

                return sessionManager.createAsync(accountId).then((sessionId) => {
                    return {
                        sessionId
                    };
                });
            });
        });
    }


    /**
     * Gets the password hash configuration for a given account ID.
     * This also generates a challenge code that is tied to the account.
     *
     * @param {string} accountId
     * @return {Promise.<accountManager~passwordHashConfig>}
     */
    function loginHashConfigAsync(accountId) {
        // Must validate the account before we create a challenge.
        // Do not use promise.props() to do both of these async calls
        // simultaneously.
        return storageService.getAsync(accountId).then((recordData) => {
            return challengeManager.createAsync(accountId).then((challengeConfig) => {
                return {
                    challengeHashConfig: challengeConfig,
                    passwordHashConfig: recordData.passwordHashConfig
                };
            });
        });
    }


    /**
     * Destroy the session record.
     *
     * @param {string} accountId
     * @param {string} sessionId
     * @return {Promise.<*>}
     */
    function logoutAsync(accountId, sessionId) {
        return sessionManager.destroyAsync(accountId, sessionId);
    }


    /**
     * Returns the password hashing settings and a new salt.
     *
     * @return {accountManager~passwordHashConfig}
     */
    function passwordHashConfigAsync() {
        return random.idAsync(passwordSaltLength).then((salt) => {
            return {
                algorithm: passwordHashConfigBase.algorithm,
                derivedLength: passwordHashConfigBase.derivedLength,
                encoding: passwordHashConfigBase.encoding,
                iterations: passwordHashConfigBase.iterations,
                salt,
                type: passwordHashConfigBase.type
            };
        });
    }


    /**
     * Filters a record to be the displayable version.
     *
     * @param {string} accountId
     * @param {accountManager~record} recordData
     * @return {Promise.<accountManager~recordResponse>}
     */
    function recordResponse(accountId, recordData) {
        return {
            accountId,
            record: {
                email: recordData.email
            }
        };
    }


    /**
     * Provides a view of the record that is filtered, removing sensitive
     * pieces of information.
     *
     * @param {string} accountId
     * @return {Promise.<accountManager~recordResponse>}
     */
    function recordAsync(accountId) {
        return storageService.getAsync(accountId).then((recordData) => {
            return recordResponse(accountId, recordData);
        });
    }


    accountIdLength = config.account.idLength;
    passwordHashConfigBase = util.clone(config.account.passwordHash);
    passwordSaltLength = config.account.passwordSaltLength;
    storageService = storageServiceFactory(config.account.idHash, config.account.lifetime, config.account.storagePrefix);

    return {
        createAsync,
        loginAsync,
        loginHashConfigAsync,
        logoutAsync,
        passwordHashConfigAsync,
        recordAsync
    };
};
