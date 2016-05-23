"use strict";

/**
 * Handles the creating, deletion, and updating of account and
 * registration files.
 */

/**
 * Information about an account holder. Used to generate/validate
 * a password and two factor authentication as well as ids and
 * contact information.
 *
 * @typedef {Object} accountService~accountFile
 * @property {string} email
 * @property {string} mfaKey
 * @property {string} password
 * @property {string} passwordSalt
 */

/**
 * @typedef {Object} accountService~accountInfo
 * @property {string} accountId
 * @property {string} password
 */

/**
 * Information sent to be saved in registration file.
 *
 * @typedef {Object} accountService~initiationFile
 * @property {string} email
 * @property {string} mfaKey
 * @property {string} passwordSalt
 */

module.exports = function (config, secureHash, storage) {
    var accountConfig, accountDirName, registrationDirName;

    accountConfig = config.account || {};
    accountDirName = accountConfig.accountDir || "account/";
    registrationDirName = accountConfig.registrationDir || "registration/";

    /**
     * Gets the key where the account will be/is stored.
     *
     * @param {string} prefix
     * @param {string} idToHash
     * @return {Promise.<string>}
     */
    function getDirectoryAsync(prefix, idToHash) {
        return secureHash.hashAsync(idToHash, accountConfig.idHash).then((hashedId) => {
            return prefix + hashedId;
        });
    }


    /**
     * Gets the account file from the directory.
     *
     * TODO: Decrypt data
     *
     * @param {string} directory
     * @return {Promise.<accountService~accountFile>}
     */
    function getAsync(directory) {
        return storage.getAsync(directory).then((accountFile) => {
            return JSON.parse(accountFile.toString("binary"));
        });
    }


    /**
     * Creates the account file in the account directory.
     *
     * @param {string} accountId
     * @param {accountService~accountFile} accountFile
     * @param {s3~putOptions} options
     * @return {Promise.<boolean>}
     */
    function makeAccountFileAsync(accountId, accountFile, options) {
        return getDirectoryAsync(accountDirName, accountId).then((accountKey) => {
            return storage.putAsync(accountKey, JSON.stringify(accountFile), options);
        });
    }


    /**
     * Completes the sign up of the account with more information from the
     * client. Also removes the registration file from the registration
     * directory when the account file is created.
     *
     * TODO: Encrypt data
     *
     * @param {accountService~accountInfo} accountInfo
     * @param {s3~putOptions} options
     * @param {string} regId
     * @return {Promise.<accountManager~completedInfo>}
     */
    function completeAsync(accountInfo, options, regId) {
        return getDirectoryAsync(registrationDirName, regId).then((registrationKey) => {
            return getAsync(registrationKey).then((accountFile) => {
                accountFile.password = accountInfo.password;

                return makeAccountFileAsync(accountInfo.accountId, accountFile, options).then(() => {
                    return storage.delAsync(registrationKey);
                });
            });
        }).then(() => {
            return {
                accountId: accountInfo.accountId
            };
        });
    }


    /**
     * Get the registration file when it's still in the registration directory.
     * This is to eliminate one step for the manager getting the directory
     * and then requesting the file.
     *
     * @param {string} regId
     * @return {Promise.<accoutService~accountFile>}
     */
    function getRegistrationFileAsync(regId) {
        return getDirectoryAsync(registrationDirName, regId).then(getAsync).then((accountFile) => {
            return accountFile;
        });
    }


    /**
     * Initiates the account creation and puts a file on the server
     * with a hashed regId.
     *
     * TODO: Encrypt data
     *
     * @param {accoutService~initiationFile} accountFile
     * @param {s3~putOptions} options
     * @param {string} regId
     * @return {Promise.<accountService~initiatedInfo>}
     */
    function signupInitiateAsync(accountFile, options, regId) {
        return getDirectoryAsync(registrationDirName, regId).then((directory) => {
            return storage.putAsync(directory, JSON.stringify(accountFile), options);
        }).then(() => {
            return {
                regId
            };
        });
    }

    return {
        completeAsync,
        getRegistrationFileAsync,
        signupInitiateAsync
    };
};
