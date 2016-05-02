"use strict";

/**
 * What we initially generate in the registration part of storage
 * till the user has confirmed and completed the account
 *
 * @typedef {Object} AccountService~initiateResult
 * @property {string} regId
 * @property {string} email
 * @property {string} mfaKey
 * @property {string} passwordSalt
 */

/**
 * Stored information for the account. This is changed from the initiated
 * file as we add password and there could be other items added after
 * we initiate the account.
 *
 * regId is removed once the account is confirmed and a file is going
 * to be generated out of the registration area.
 *
 * @typedef {Object} AccountService~accountFile
 * @property {string} accountId
 * @property {string} email
 * @property {string} mfaKey
 * @property {string} password
 * @property {string} passwordSalt
 * @property {string} regId
 */

/**
 * Handles the creating, deletion, and updating of account and
 * registration files.
 *
 * @param {Object} config
 * @param {Object} secureHash
 * @param {Object} Storage
 * @return {Object} account service object
 */
module.exports = function(config, secureHash, Storage) {
    var accountConfig, accountDirName, registrationDirName, storage;

    accountConfig = config.account || {};
    accountDirName = accountConfig.accountDir || "account/";
    registrationDirName = accountConfig.registrationDir || "registration/";
    storage = new Storage().configure(config.storage);

    /**
     * Completes the sign up of the account with more information from the
     * client. This adds the accountId and password to the account file
     * and removes the regId as it is no longer needed.
     *
     * Also removes the registration file from the registration directory
     * when the account file is created.
     *
     * TODO: Encrypt data
     *
     * @param {Object} accountInfo
     * @param {Object} options
     * @param {string} regId
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


    /**
     * Creats the account file in the account directory.
     *
     * @param {Object} accountInfo
     * @param {Object} options
     * @return {Promise.<boolean>}
     */
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
     * @param {string} directory
     * @return {Promise.<AccountService~accountFile>}
     */
    function getAsync (directory) {
        return storage.getAsync(directory).then((accountFile) => {
            return JSON.parse(accountFile.toString("binary"));
        });
    }


    /**
     * Get the registration file when it's still in the registration directory.
     * This is to eliminate one steps for the manager getting the directory
     * and then requesting the file.
     *
     * @param {string} regId
     * @return {Promise.<accoutService~accountFile>}
     */
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
     * @param {Object} accountInfo
     * @param {Object} options
     * @return {Promise.<Object>}
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
