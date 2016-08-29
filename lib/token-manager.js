"use strict";

/**
 * @typedef {Object} tokenManager~record
 * @property {string} contentType
 * @property {string} data
 * @property {boolean} [public]
 */

/**
 * @typedef {Object} tokenManager~createOptions
 * @property {string} [contentType]
 * @property {boolean} [public]
 */

module.exports = (config, promise, random, storageServiceFactory) => {
    var idLength, storageService;


    /**
     * Verifies that an account ID is not empty.
     *
     * @param {string} accountId
     * @return {Promise.<*>}
     */
    function checkAccountIdAsync(accountId) {
        if (accountId) {
            return promise.resolve();
        }

        return promise.reject(new Error("Account ID must not be empty"));
    }


    /**
     * Verifies an account ID and a token ID are not empty.
     *
     * @param {string} accountId
     * @param {string} tokenId
     * @return {Promise.<*>}
     */
    function checkBothAsync(accountId, tokenId) {
        return checkAccountIdAsync(accountId).then(() => {
            if (!tokenId) {
                throw new Error("Token ID must not be empty");
            }
        });
    }


    /**
     * Creates a new token.
     *
     * @param {string} accountId
     * @param {(Buffer|string)} data
     * @param {tokenManager~createOptions} options
     * @return {Promise.<string>} tokenId
     */
    function createAsync(accountId, data, options) {
        var record;

        record = {
            contentType: "application/octet-stream",
            data
        };

        if (options.contentType) {
            record.contentType = options.contentType;
        }

        if (options.public) {
            record.public = true;
        }

        return checkAccountIdAsync(accountId).then(() => {
            return random.idAsync(idLength);
        }).then((tokenId) => {
            return storageService.putAsync([
                accountId,
                tokenId
            ], record).then(() => {
                return tokenId;
            });
        });
    }


    /**
     * Destroy a token.
     *
     * @param {string} accountId
     * @param {string} tokenId
     * @return {Promise.<*>}
     */
    function deleteAsync(accountId, tokenId) {
        return checkBothAsync(accountId, tokenId).then(() => {
            return storageService.deleteAsync([
                accountId,
                tokenId
            ]);
        });
    }


    /**
     * Retrieves a token from the storage service.
     *
     * @param {string} accountId
     * @param {string} tokenId
     * @return {Promise.<tokenManager~record>}
     */
    function getRecordAsync(accountId, tokenId) {
        return checkBothAsync(accountId, tokenId).then(() => {
            return storageService.getAsync([
                accountId,
                tokenId
            ]);
        });
    }


    idLength = config.token.idLength;
    storageService = storageServiceFactory([
        config.account.idHash,
        config.token.idHash
    ], config.token.lifetime, config.token.storagePrefix);

    return {
        createAsync,
        deleteAsync,
        getRecordAsync
    };
};
