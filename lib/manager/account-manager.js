"use strict";
/**
 * Manages the business logic of account controls.
 */

/**
 * The object passed into complete.
 *
 * @typedef {Account~accountinfo}
 * @param {string} email
 * @param {string} accountId this is the unhashed account id sent to client
 * @param {string} currentMfa
 * @param {string} previousMfa
 * @param {string} password
 */
class AccountManager {
    /**
     * @param {Object} accountService
     * @param {Object} config
     * @param {Object} hotp
     * @param {Object} otDate
     * @param {Object} password
     * @param {Object} promise
     * @param {Object} random
     */
    constructor(accountService, config, hotp, otDate, random, password, promise) {
        this.accountService = accountService;
        this.config = config;
        this.hotp = hotp;
        this.otDate = otDate;
        this.random = random;
        this.password = password;
        this.promise = promise;
    }


    /**
     * Validates the previous and current MFA values are valid and sends
     * data off to Account service class for updating/putting data into
     * the Account record.
     *
     * Password generation should follow this format:
     * // insert password generation here
     *
     * @param {AccountManager~accountInfo} accountInfo
     * @return {Promise}
     */
    complete(accountInfo) {
        var directory;

        directory = this.getDirectory("account/", accountInfo.accountId);

        return this.accountService.get(directory).then((accountFile) => {
            var hotpOptions;

            if (this.config.hotp && this.config.hotp.previous) {
                hotpOptions = this.config.hotp.previous;
            }

            return this.promise.props({
                previousMfa: this.hotp.verifyToken(accountFile.account.mfa, accountInfo.previousMfa, hotpOptions),
                currentMfa: this.hotp.verifyToken(accountFile.account.mfa, accountInfo.currentMfa)
            }).then((bits) => {
                var expires, options;

                if (! bits.previousMfa || ! bits.currentMfa) {
                    return false;
                }

                expires = this.otDate.now().plus(this.config.account.completeLifetime).toString();
                options = {
                    expires: expires
                };

                return this.account.put(directory, accountFile, accountInfo, options);
            });
        });
    }


    /**
     * Gets the directory where the account will be/is stored.
     *
     * @param {string} prefix
     * @param {string} accountId
     * @return {string} the directory
     */
    getDirectory(prefix, accountId) {
        return prefix + this.password.hashContent(accountId);
    }


    /**
     * Initiates the account creation and puts a file on the server
     * with a hashed accountId.
     *
     * @return {Promise.<Object>}
     */
    initiate() {
        return this.promise.props({
            accountId: this.random.password(24),
            salt: this.random.password(128),
            mfa: this.hotp.generateSecret()
        }).then((bits) => {
            var directory, expires, options;

            expires = this.otDate.now().plus(this.config.account.initiateLifetime).toString();
            options = {
                expires: expires
            };

            directory = this.getDirectory("account/", bits.accountId);

            return this.accountService.initiate(directory, bits, options).then((contents) => {
                return contents;
            });
        });
    }
}

module.exports = AccountManager;