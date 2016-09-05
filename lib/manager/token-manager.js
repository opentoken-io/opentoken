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

        options = options || {};

        if (options.contentType) {
            record.contentType = options.contentType;
        }

        if (options.public) {
            record.public = true;
        }

        return random.idAsync(idLength).then((tokenId) => {
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
        return storageService.deleteAsync([
            accountId,
            tokenId
        ]);
    }


    /**
     * Retrieves a token from the storage service.
     *
     * @param {string} accountId
     * @param {string} tokenId
     * @return {Promise.<tokenManager~record>}
     */
    function getRecordAsync(accountId, tokenId) {
        return storageService.getAsync([
            accountId,
            tokenId
        ]);
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
