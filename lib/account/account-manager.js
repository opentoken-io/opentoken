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
     * hash(hash(password) + salt)
     *
     * @param {AccountManager~accountInfo} accountInfo
     * @return {Promise.<AccountService~accountFile>}
     */
    completeAsync(accountInfo) {
        return this.accountService.getDirectoryAsync(accountInfo.accountId, this.config.account).then((directory) => {

            return this.accountService.getAsync(directory).then((accountFile) => {
                var options;

                if (! this.hotp.verifyToken(accountFile.mfaKey, accountInfo.previousMfa, 1)) {
                    throw new Error("Previous MFA Token did not validate");
                }

                if (! this.hotp.verifyToken(accountFile.mfaKey, accountInfo.currentMfa)) {
                    throw new Error("Current MFA Token did not validate");
                }

                options = {
                    expires: this.otDate.now().plus(this.config.account.completeLifetime)
                };

                return this.accountService.completeAsync(directory, accountInfo, options);
            });
        });
    }


    /**
     * Initiates the account creation and puts a file on the server
     * with a hashed accountId.
     *
     * TODO: Validate email before doing anything else
     *
     * @param {Object} accountInfo
     * @return {Promise.<accountService~initiateResult>}
     */
    initiateAsync(accountInfo) {
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

            return this.accountService.getDirectoryAsync(bits.accountId).then((directory) => {
                return this.accountService.initiateAsync(directory, bits, options);
            });
        });
    }
}

module.exports = AccountManager;