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
    constructor(accountService, config, hotp, otDate, random, promise) {
        this.accountService = accountService;
        this.config = config;
        this.hotp = hotp;
        this.otDate = otDate;
        this.random = random;
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
        return this.accountService.get(accountInfo.accountId).then((accountFile) => {
            var hotpOptions, options;

            if (this.config.hotp && this.config.hotp.previous) {
                hotpOptions = this.config.hotp.previous;
            }

            if (! this.hotp.verifyToken(accountFile.mfa, accountInfo.previousMfa, hotpOptions)) {
                throw new Error("Previous MFA Token did not validate");
            }

            if (! this.hotp.verifyToken(accountFile.mfa, accountInfo.currentMfa)) {
                throw new Error("Current MFA Token did not validate");
            }

            options = {
                expires: this.otDate.now().plus(this.config.account.completeLifetime)
            };

            return this.accountService.complete(accountInfo.accountId, accountInfo, options);
        });
    }


    /**
     * Initiates the account creation and puts a file on the server
     * with a hashed accountId.
     *
     * TODO: Validate email before doing anything else
     *
     * @param {Object} accountInfo
     * @return {Promise.<Object>} accountService~initiateResult
     */
    initiate(accountInfo) {
        return this.promise.props({
            accountId: this.random.password(24),
            mfaKey: this.hotp.generateSecretAsync(),
            salt: this.random.password(128)
        }).then((bits) => {
            var options;

            bits.email = accountInfo.email;

            options = {
                expires: this.otDate.now().plus(this.config.account.initiateLifetime)
            };

            return this.accountService.initiate(bits.accountId, bits, options);
        });
    }
}

module.exports = AccountManager;