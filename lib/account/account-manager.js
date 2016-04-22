"use strict";
/**
 * Manages the business logic of account controls.
 */

/**
 * The object passed into complete.
 * // fidian: define better
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
     * // fidian: insert password generation here for realz, yo!
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

            if (! this.hotp.verifyToken(accountFile.account.mfa, accountInfo.previousMfa, hotpOptions)) {
                throw new Error("previous did not validate");
            }

            if (! this.hotp.verifyToken(accountFile.account.mfa, accountInfo.currentMfa)) {
                throw new Error("current did not validate");
            }

            options = {
                expires: this.otDate.now().plus(this.config.account.completeLifetime).toString()
            };

            return this.account.complete(accountInfo.accountId, accountFile, accountInfo, options);
        });
    }


    /**
     * Initiates the account creation and puts a file on the server
     * with a hashed accountId.
     *
     * @return {Promise.<Object>}  // fidian ORLY? That's not descriptive.  accountService~initiateResult
     */
    initiate(accountInfo) {
        // fidian:  validate the email here before we do anything else
        // fidian:  Look into JSON Schema validators.  I like tv4 a lot.
        return this.promise.props({
            accountId: this.random.password(24),
            salt: this.random.password(128),
            mfa: this.hotp.generateSecret()
        }).then((bits) => {
            var options;

            options = {
                expires: this.otDate.now().plus(this.config.account.initiateLifetime)
            };

            return this.accountService.initiate(bits.accountId, bits, options);
        });
    }
}

module.exports = AccountManager;