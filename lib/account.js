"use strict";

/**
 * Handles account creation from initiating to confirmation.
 */

class Account {
    constructor(base64, config, hotp, password, storage) {
        this.base64 = base64;
        this.config = config;
        this.hotp = hotp;
        this.password = password;
        this.storage = storage;
        this.storage.configure(config.storage);
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
     * TODO: Decrypt data here
     *
     * @param {Object} accountInfo
     * @return {Promise.<boolean>}
     */
    complete(accountInfo) {
        var directory;

        directory = this.getDirectory("account/", accountInfo.accountId);

        return this.storage.get(directory).then((accountFile) => {
            var directory, expires, options, unwrapped, hotpOptions;

            unwrapped = JSON.parse(accountFile.toString("binary"));

            if (this.config.hotp && this.config.hotp.previous) {
                hotpOptions = this.config.hotpOptions.previous;
            }

            return this.hotp.verifyToken(unwrapped.mfa, accountInfo.previousMfa, hotpOptions).then(() => {

                return this.hotp.verifyToken(unwrapped.mfa, accountInfo.currentMfa).then(() => {
                    unwrapped.email = accountInfo.email;
                    unwrapped.account.email = accountInfo.email;
                    unwrapped.account.password = accountInfo.password;
                    expires = new Date();
                    expires = expires.setDate(expires.getDate() + 7);
                    options = {
                        expires: new Date(expires)
                    };

                    return this.storage.put(directory, JSON.stringify(unwrapped), options).then(() => {
                        return true;
                    });
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
        return this.hotp.generateSecret().then((secretKey) => {
            var contents, directory, expires, options, wrapper;

            contents = {
                accountId: this.password.generate(28),
                salt: this.password.generate(128),
                mfa: secretKey
            };
            wrapper = {
                email: "",
                account: contents
            };
            expires = new Date();
            expires = expires.setHours(expires.getHours() + 1);
            options = {
                expires: new Date(expires)
            };
            directory = this.getDirectory("account/", contents.accountId);

            return this.storage.put(directory, JSON.stringify(wrapper), options).then(() => {
                return contents;
            });
        });
    }
}

module.exports = Account;