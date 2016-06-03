"use strict";

/**
 * @typedef {Object} accountManager~passwordHashConfig
 * @property {string} algorithm
 * @property {number} derivedLength
 * @property {string} encoding
 * @property {number} iterations
 * @property {string} salt
 * @property {string} type
 */

/**
 * @typedef {Object} accountManager~record
 * @property {string} email
 * @property {string} passwordHash
 * @property {accountManager~passwordHashConfig} passwordHashConfig
 * @property {Object} totp
 * @property {string} totp.key
 */

module.exports = (accountService, config, promise, random) => {
    var accountIdLength, passwordHashConfigBase, passwordSaltLength;


    /**
     * Create a new account record
     *
     * @param {accountManager~record} record
     * @return {Promise.<string>} account ID
     */
    function createAsync(record) {
        return random.idAsync(accountIdLength).then((id) => {
            return accountService.put(id, record, {
                email: record.email
            }).then(() => {
                return id;
            });
        });
    }

    /**
     * Returns the password hashing settings and a new salt.
     *
     * @return {accountManager~passwordHashConfig}
     */
    function passwordHashConfigAsync() {
        return random.idAsync(passwordSaltLength).then((salt) => {
            return {
                algorithm: passwordHashConfigBase.algorithm,
                derivedLength: passwordHashConfigBase.derivedLength,
                encoding: passwordHashConfigBase.encoding,
                iterations: passwordHashConfigBase.iterations,
                salt,
                type: passwordHashConfigBase.type
            };
        });
    }

    accountIdLength = config.account.idLength;
    passwordHashConfigBase = {
        algorithm: config.account.passwordHash.algorithm,
        derivedLength: config.account.passwordHash.derivedLength,
        encoding: config.account.passwordHash.encoding,
        iterations: config.account.passwordHash.iterations,
        type: config.account.passwordHash.type
    };
    passwordSaltLength = config.account.passwordSaltLength;

    return {
        createAsync,
        passwordHashConfigAsync
    };
};
