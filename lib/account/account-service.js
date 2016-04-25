"use strict";

/**
 * What we initially send back to the client so they can start to initiate
 * the complete procedure and save information.
 *
 * @typedef {accountService~initiateResult}
 * @param {string} accountId
 * @param {string} email
 * @param {string} mfaKey
 * @param {string} salt
 */

/**
 * Handles account creation from initiating to confirmation.
 */
class AccountService {
    /**
     * Used for Dependency Injection and initial configuration
     * of the storage plugin.
     *
     * @param {Object} config
     * @param {Object} password
     * @param {Object} storage
     */
    constructor(config, password, storage) {
        this.accountFile = null;
        this.password = password;
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
     * @param {Object} options
     * @return {Promise.<boolean>}
     */
    completeAsync(directory, accountInfo, options) {
        this.accountFile.password = accountInfo.password;

        return this.storage.putAsync(directory, JSON.stringify(this.accountFile), options).then(() => {
            return this.accountFile;
        });
    }


    /**
     * Gets the account file from the directory.
     *
     * TODO: Decrypt data
     *
     * @param {string} accountId
     * @return {Promise.<Object>}
     */
    getAsync(accountId) {
        return this.storage.getAsync(this.getDirectory(accountId)).then((accountFile) => {
            this.accountFile = accountFile;
            return JSON.parse(this.accountFile.toString("binary"));
        });
    }


    /**
     * Gets the directory where the account will be/is stored.
     *
     * @param {string} accountId
     * @return {string} the directory
     */
    getDirectory(accountId) {
        return "account/" + this.password.hashContent(accountId);
    }


    /**
     * Initiates the account creation and puts a file on the server
     * with a hashed accountId.
     *
     * TODO: Encrypt data
     *
     * @param {string} accountId
     * @param {Object} accountInfo
     * @param {Object} options
     * @return {Promise.accountService~initiateResult}
     */
    initiateAsync(accountId, accountInfo, options) {
        return this.storage.putAsync(this.getDirectory(accountId), JSON.stringify(accountInfo), options).then(() => {
            return accountInfo;
        });
    }
}

module.exports = AccountService;