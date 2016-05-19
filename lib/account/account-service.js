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

module.exports = function (config, promise, secureHash, storage) {
    var accountConfig, loginConfig;

    accountConfig = config.account;
    loginConfig = config.login;

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
        return getDirectoryAsync(accountConfig.registrationDir, regId).then((registrationKey) => {
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
     * Deletes the login file in the account directory.
     *
     * @param {string} hashedAccountId
     * @param {string} loginId
     * @return {Promise.<boolean>}
     */
    function deleteLoginFileAsync(hashedAccountId, loginId) {
        return secureHash.encodeUriAsync(loginId, accountConfig.idHash).then((hashedLoginId) => {
            var loginKey;

            loginKey = makeLoginKey(hashedAccountId, hashedLoginId);

            return storage.delAsync(loginKey);
        });
    }


    /**
     * Creates a password hash using the same method
     * an account holder used to create a password to login.
     *
     * @param {string} accountId
     * @param {string} salt
     * @return {Promise.<string>}
     */
    function hashPasswordAsync(accountId, salt) {
        return getDirectoryAsync(accountId).then((accountFile) => {
            return secureHash.encodeAsync(accountFile.password + salt, accountFile.pbkdf2).then((hashedPassword) => {
                return secureHash.createHash(hashedPassword, loginConfig.challenge.algo);
            });
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
        return getDirectoryAsync(accountConfig.accountDir, accountId).then((accountKey) => {
            return storage.putAsync(accountKey, JSON.stringify(accountFile), options);
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
     * Get the registration file when it's still in the registration directory.
     * This is to eliminate one step for the manager getting the directory
     * and then requesting the file.
     *
     * @param {string} regId
     * @return {Promise.<accoutService~accountFile>}
     */
    function getAccountFileAsync(accountId) {
        return getDirectoryAsync(accountConfig.accountDir, accountId).then(getAsync).then((accountFile) => {
            return accountFile;
        });
    }


    /**
     * Gets the login file from the accout directory.
     *
     * @param {string} hashedAccountId
     * @param {string} loginId
     * @return {Promise.<*>}
     */
    function getLoginFileAsync(hashedAccountId, loginId) {
        return secureHash.encodeUriAsync(loginId, accountConfig.idHash).then((hashedLoginId) => {
            var loginKey;

            loginKey = makeLoginKey(hashedAccountId, hashedLoginId);

            return getAsync(loginKey);
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
        return getDirectoryAsync(accountConfig.registrationDir, regId).then(getAsync).then((accountFile) => {
            return accountFile;
        });
    }


    /**
     * Gets the key where the account will be/is stored.
     *
     * @param {string} prefix
     * @param {string} idToHash
     * @return {Promise.<string>}
     */
    function getDirectoryAsync(prefix, idToHash) {
        return secureHash.encodeUriAsync(idToHash, accountConfig.idHash).then((hashedId) => {
            return prefix + hashedId;
        });
    }


    /**
     * Makes a challenge key from hashes and directory names.
     * Errors when config settings are not in place because we
     * do not want a directory to have undefined in the key.
     *
     * @param {string} accountIdHash
     * @param {string} challengeIdHash
     * @return {string}
     */
    function makeLoginKey(accountIdHash, loginIdHash) {
        return accountConfig.accountDir + accountIdHash + loginConfig.loginDir + loginIdHash;
    }


    /**
     * Writes the login file in the account directory
     *
     * @param {Object} loginFile
     * @param {string} accountId,
     * @param {s3~putOptions} options
     * @return {Promise.<boolean>}
     */
    function putLoginFileAsync(loginFile, hashedAccountId, options) {
        return secureHash.encodeUriAsync(loginFile.loginId, accountConfig.idHash).then((loginIdHash) => {
            var loginKey;

            loginKey = makeLoginKey(hashedAccountId, loginIdHash);

            return storage.putAsync(loginKey, JSON.stringify(loginFile), options);
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
        return getDirectoryAsync(accountConfig.registrationDir, regId).then((directory) => {
            return storage.putAsync(directory, JSON.stringify(accountFile), options);
        }).then(() => {
            return {
                regId: regId
            };
        });
    }

    return {
        completeAsync: completeAsync,
        deleteLoginFileAsync: deleteLoginFileAsync,
        getAccountFileAsync: getAccountFileAsync,
        getLoginFileAsync: getLoginFileAsync,
        getRegistrationFileAsync: getRegistrationFileAsync,
        hashPasswordAsync: hashPasswordAsync,
        putLoginFileAsync: putLoginFileAsync,
        signupInitiateAsync: signupInitiateAsync
    };
};
