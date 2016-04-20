"use strict";

/**
 * Handles account creation from initiating to confirmation.
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

class Account {
    /**
     * Used for Dependency Injection and initial configuration
     * of the storage plugin.
     *
     * @param {Object} config
     * @param {Object} hotp
     * @param {Object} otDate
     * @param {Object} password
     * @param {Object} promise
     * @param {Object} random
     * @param {Object} storage
     */
    constructor(config, hotp, otDate, password, promise, random, storage) {
        this.config = config;
        this.hotp = hotp;
        this.otDate = otDate;
        this.password = password;
        this.promise = promise;
        this.random = random;
        this.storage = storage.configure(config.storage);
    }


    /**
     * Completes the sign up of the account with more information from the
     * client. We need the client to create the password using their tools
     * so we never see the plain text version of it. This helps to keep
     * the system more secure
     *
     * Password generation should follow this format:
     * // insert password generation here
     *
     *
     * TODO: Decrypt data here
     *
     * @param {Object~accountInfo} accountInfo
     * @return {Promise.<boolean>}
     */
    complete(accountInfo) {
        var directory;

        directory = this.getDirectory("account/", accountInfo.accountId);

        return this.storage.get(directory).then((accountFile) => {
            var unwrapped, hotpOptions;

            unwrapped = JSON.parse(accountFile.toString("binary"));

            if (this.config.hotp && this.config.hotp.previous) {
                hotpOptions = this.config.hotp.previous;
            }

            return this.promise.props({
                previousMfa: this.hotp.verifyToken(unwrapped.account.mfa, accountInfo.previousMfa, hotpOptions),
                currentMfa: this.hotp.verifyToken(unwrapped.account.mfa, accountInfo.currentMfa)
            }).then((bits) => {
                var expires, options;

                if (! bits.previousMfa || ! bits.currentMfa) {
                    //return false;
                }

                unwrapped.email = accountInfo.email;
                unwrapped.account.email = accountInfo.email;
                unwrapped.account.password = accountInfo.password;
                expires = this.otDate.now().plus(this.config.account.completeLifetime).toString();
                options = {
                    expires: expires
                };

                return this.storage.put(directory, JSON.stringify(unwrapped), options).then(() => {
                    return true;
                });
            });
        });
    }


    /**
     * Gets the directory where the account (will be|is) stored.
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
     * TODO: Encrypt contents before putting to storage
     *
     * @return {Promise.<Object>}
     */
    initiate() {
        return this.promise.props({
            accountId: this.random.password(24),
            salt: this.random.password(128),
            mfa: this.hotp.generateSecret()
        }).then((bits) => {
            var contents, directory, expires, options, wrapper;

            contents = {
                accountId: bits.accountId,
                salt: bits.salt,
                mfa: bits.mfa
            };
            wrapper = {
                email: "",
                account: contents
            };
            expires = this.otDate.now().plus(this.config.account.initiateLifetime).toString();
            options = {
                expires: expires
            };
            directory = this.getDirectory("account/", contents.accountId);

            return this.storage.put(directory, JSON.stringify(wrapper), options).then(() => {
                return contents;
            });
        });
    }
}

module.exports = Account;