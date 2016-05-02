"use strict";

/**
 * What we initially send back to the client so they can start to initiate
 * the complete procedure and save information.
 *
 * @typedef {Object} AccountService~initiateResult
 * @property {string} accountId
 * @property {string} email
 * @property {string} mfaKey
 * @property {string} passwordSalt
 */

/**
 * Stored information for the account.  This is changed from the initiated
 * file as we add password and there could be other items added after
 * we initiate the account.
 *
 * @typedef {Object} AccountService~accountFile
 * @property {string} accountId
 * @property {string} email
 * @property {string} mfaKey
 * @property {string} password
 * @property {string} passwordSalt
 */

/**
 * Handles account creation from initiating to confirmation.
 */

module.exports = function(config, secureHash, Storage) {
    var accountConfig, accountDirName, registrationDirName, storage;

    accountConfig = config.account || {};
    accountDirName = accountConfig.accountDir || "account/";
    registrationDirName = accountConfig.registrationDir || "registration/";
    storage = new Storage().configure(config.storage);

    /**
     * Completes the sign up of the account with more information from the
     * client. We need the client to create the password using their tools
     * so we never see the plain text version of it. This helps to keep
     * the system more secure
     *
     * TODO: Encrypt data
     *
     * @param {Object} accountInfo
     * @param {Object} options
     * @return {Promise.<Object>}
     */
    function completeAsync (accountInfo, options, regId) {
        return getDirectoryAsync(registrationDirName, regId).then((regDirectory) => {
            return getAsync(regDirectory).then((accountFile) => {
                accountFile.accountId = accountInfo.accountId;
                accountFile.password = accountInfo.password;
                delete accountFile.regId;

                return makeAccountFileAsync(accountFile, options).then(() => {
                    return storage.delAsync(regDirectory).then(() => {
                        return {
                            accountId: accountInfo.accountId
                        };
                    });
                });
            });
        });
    }

    function makeAccountFileAsync(accountInfo, options) {
        return getDirectoryAsync(accountDirName, accountInfo.accountId).then((accountDir) => {
            return storage.putAsync(accountDir, JSON.stringify(accountInfo), options);
        });
    }


    /**
     * Gets the account file from the directory.
     *
     * TODO: Decrypt data
     *
     * @param {string} accountId
     * @return {Promise.<AccountService~accountFile>}
     */
    function getAsync (directory) {
        return storage.getAsync(directory).then((accountFile) => {
            return JSON.parse(accountFile.toString("binary"));
        });
    }


    function getRegistrationFileAsync (regId) {
        return getDirectoryAsync(registrationDirName, regId).then((directory) => {
            return getAsync(directory).then((accountFile) => {
                return accountFile;
            });
        });
    }


    /**
     * Gets the directory where the account will be/is stored.
     *
     * @param {string} prefix
     * @param {string} idToHash
     * @return {Promise.<string>}
     */
    function getDirectoryAsync (prefix, idToHash) {
        return secureHash.hashAsync(idToHash, accountConfig.idHash || {}).then((hashedId) => {
            return prefix + hashedId;
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
     * @return {Promise.<string>}
     */
    function signupInitiateAsync (accountInfo, options) {
        return getDirectoryAsync(registrationDirName, accountInfo.regId).then((directory) => {
            return storage.putAsync(directory, JSON.stringify(accountInfo), options).then(() => {
                return {
                    regId: accountInfo.regId
                };
            });
        });
    }

    return {
        completeAsync: completeAsync,
        getRegistrationFileAsync: getRegistrationFileAsync,
        signupInitiateAsync: signupInitiateAsync
    };
};
