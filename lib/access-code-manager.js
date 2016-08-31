"use strict";

/**
 * @typedef {Object} accessCodeManager~codeInfo
 * @property {string} code
 * @property {OtDate} expires
 * @property {string} secret
 */

/**
 * @typedef {Object} accessCodeManager~createRequest
 * @property {string} [description]
 * @see {@link ../schema/account/access-code-request}
 */

/**
 * @typedef {Object} accessCodeManager~record
 * @property {string} secret
 */

module.exports = (config, promise, random, storageServiceFactory) => {
    var codeLength, secretLength, storageService;

    /**
     * Create a set of API credentials.
     *
     * @param {string} accountId
     * @param {accessCodeManager~createRequest} request
     * @return {Promise.<accessCodeManager~codeInfo>}
     * @see {accessCodeManager~record}
     */
    function createAsync(accountId, request) {
        return promise.props({
            code: random.idAsync(codeLength),
            secret: random.idAsync(secretLength)
        }).then((bits) => {
            var privatePortion, publicPortion;

            privatePortion = {
                secret: bits.secret
            };
            publicPortion = {};

            if (request.description) {
                privatePortion.description = request.description;
                publicPortion.description = request.description;
            }

            return storageService.putAsync([
                accountId,
                bits.code
            ], privatePortion, publicPortion).then((recordOptions) => {
                return {
                    code: bits.code,
                    expires: recordOptions.expires.toString(),
                    secret: bits.secret
                };
            });
        });
    }


    /**
     * Remove a set of API credentials
     *
     * @param {string} accountId
     * @param {string} code
     * @return {Promise.<*>}
     */
    function deleteAsync(accountId, code) {
        return storageService.deleteAsync([
            accountId,
            code
        ]);
    }


    /**
     * Retrieve a set of API credentials
     *
     * @param {string} accountId
     * @param {string} code
     * @return {Promise.<accessCodeManager~record>}
     */
    function getAsync(accountId, code) {
        return storageService.getAsync([
            accountId,
            code
        ]);
    }


    codeLength = config.accessCode.codeLength;
    secretLength = config.accessCode.secretLength;
    storageService = storageServiceFactory([
        config.account.idHash,
        config.accessCode.codeHash
    ], config.accessCode.lifetime, config.accessCode.storagePrefix);

    return {
        createAsync,
        deleteAsync,
        getAsync
    };
};
