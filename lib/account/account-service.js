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
 * @typedef {Object} AccountService~accountFile
 * @property {string} email
 * @property {string} mfaKey
 * @property {string} password
 * @property {string} passwordSalt
 */

module.exports = function (config, secureHash, storage) {
    var accountConfig, accountDirName, registrationDirName, storage;

    accountConfig = config.account || {};
    accountDirName = accountConfig.accountDir || "account/";
    registrationDirName = accountConfig.registrationDir || "registration/";

    /**
     * Completes the sign up of the account with more information from the
     * client. Also removes the registration file from the registration
     * directory when the account file is created.
     *
     * TODO: Encrypt data
     *
     * @param {Object} accountInfo
     * @param {Object} options
     * @param {string} regId
     * @return {Promise.<accountManager~completionInfo>}
     */
    function completeAsync(accountInfo, options, regId) {
        return getDirectoryAsync(registrationDirName, regId).then(getAsync).then((accountFile) => {
            accountFile.password = accountInfo.password;

            return makeAccountFileAsync(accountInfo.accountId, accountFile, options).then(storage.delAsync);
        }).then(() => {
            return {
                accountId: accountInfo.accountId
            };
        });
    }


    /**
     * Creates the account file in the account directory.
     *
     * @param {Object} accountInfo
     * @param {Object} options
     * @return {Promise.<string>} the directory used to put the file
     */
    function makeAccountFileAsync(accountId, accountFile, options) {
        return getDirectoryAsync(accountDirName, accountId).then((accountDir) => {
            return storage.putAsync(accountDir, JSON.stringify(accountFile), options).then(() => {
                return accountDir;
            });
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
    function getAsync(directory) {
        return storage.getAsync(directory).then((accountFile) => {
            return JSON.parse(accountFile.toString("binary"));
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
     * Gets the directory where the account will be/is stored.
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
     * Initiates the account creation and puts a file on the server
     * with a hashed regId.
     *
     * TODO: Encrypt data
     *
     * @param {Object} accountInfo
     * @param {Object} options
     * @param {string} regId
     * @return {Promise.<accountManager~initiationInfo>}
     */
    function signupInitiateAsync(accountFile, options, regId) {
        return getDirectoryAsync(registrationDirName, regId).then((directory) => {
            return storage.putAsync(directory, JSON.stringify(accountFile), options);
        }).then(() => {
            return {
                regId: regId
            };
        });
    }

    return {
        completeAsync: completeAsync,
        getRegistrationFileAsync: getRegistrationFileAsync,
        signupInitiateAsync: signupInitiateAsync
    };
};
