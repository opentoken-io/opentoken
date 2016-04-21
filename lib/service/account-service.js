"use strict";

/**
 * Handles account creation from initiating to confirmation.
 */
class AccountService {
    /**
     * Used for Dependency Injection and initial configuration
     * of the storage plugin.
     *
     * @param {Object} config
     * @param {Object} storage
     */
    constructor(config, storage) {
        this.storage = storage.configure(config.storage);
    }


    /**
     * Completes the sign up of the account with more information from the
     * client. We need the client to create the password using their tools
     * so we never see the plain text version of it. This helps to keep
     * the system more secure
     *
     * TODO: Encrypt data
     *
     * @param {string} directory
     * @param {Object} accountInfo
     * @param {Object} accountFile
     * @param {Object} options
     * @return {Promise.<boolean>}
     */
    complete(directory, accountInfo, accountFile, confirmCode, options) {
        accountFile.email = accountInfo.email;
        accountFile.account.email = accountInfo.email;
        accountFile.account.password = accountInfo.password;
        accountFile.expires = options.expires;
        accountFile.confirmCode = confirmCode;

        return this.storage.put(directory, JSON.stringify(accountFile), options).then(() => {
            return true;
        });
    }


    /**
     * Puts the file with new expires after confirming
     *
     * TODO: Encrypt overall file
     *
     * @param {string} directory
     * @param {Object} accountFile
     * @param {Object} options
     * @param {Promise.<boolean>}
     */
    confirm(directory, accountFile, options) {
        accountFile.expires = options.expires;

        return this.storage.put(directory, JSON.stringify(accountFile), options).then(() => {
            return true;
        });


    }


    /**
     * Gets the account file from the directory.
     *
     * TODO: Decrypt data
     *
     * @param {string} directory
     * @return {Promise}
     */
    get(directory) {
        return this.storage.get(directory).then((accountFile) => {
            return JSON.parse(accountFile.toString("binary"));
        });
    }


    /**
     * Initiates the account creation and puts a file on the server
     * with a hashed accountId.
     *
     * TODO: Encrypt data
     *
     * @param {string} directory
     * @param {Object} accountInfo
     * @param {Object} options
     * @return {Promise.<Object>}
     */
    initiate(directory, accountInfo, options) {
        var contents, options, accountFile;

        contents = {
            accountId: accountInfo.accountId,
            salt: accountInfo.salt,
            mfa: accountInfo.mfa
        };
        accountFile = {
            email: "",
            expires: options.expires,
            confirmCode: "",
            account: contents
        };

        return this.storage.put(directory, JSON.stringify(accountFile), options).then(() => {
            return contents;
        });
    }
}

module.exports = AccountService;