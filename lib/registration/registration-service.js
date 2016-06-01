"use strict";

/**
 * Handles the creating, deletion, and updating of account and
 * registration files.
 *
 * @param {Object} config
 * @param {Object} OtDate Helper object and Object class, like Date
 * @param {Object} promise
 * @param {Object} record
 * @param {Object} secureHash
 * @param {Object} storage
 * @return {Function} factory
 */
module.exports = (config, OtDate, promise, record, secureHash, storage) => {
    var idHash, lifetime, storagePrefix;


    /**
     * Returns the key used in storage for a given record ID
     *
     * @param {string} recordId
     * @return {Promise.<string>} full key to use in storage engine
     */
    function storageKeyAsync(recordId) {
        return secureHash.hashAsync(recordId, idHash).then((hashed) => {
            return storagePrefix + hashed;
        });
    }


    /**
     * Delete a registration file
     *
     * @param {string} recordId
     * @return {Promise.<*>}
     */
    function delAsync(recordId) {
        return storageKeyAsync(recordId).then((key) => {
            return storage.delAsync(key);
        });
    }


    /**
     * Retrieves your data
     *
     * @param {string} recordId
     * @return {Promise.<*>} Original data
     */
    function getAsync(recordId) {
        return storageKeyAsync(recordId).then((key) => {
            return storage.getAsync(key);
        }).then((frozen) => {
            return record.thawAsync(frozen, recordId);
        });
    }


    /**
     * Saves data
     *
     * @param {string} recordId
     * @param {*} data
     * @param {*} metadata
     * @return {Promise.<*>}
     */
    function putAsync(recordId, data, metadata) {
        var options;

        options = {
            expires: OtDate.now().plus(lifetime)
        };

        return promise.props({
            frozenData: record.freezeAsync(data, recordId, options, metadata),
            key: storageKeyAsync(recordId)
        }).then((bits) => {
            return storage.putAsync(bits.key, bits.frozenData, options);
        });
    }

    idHash = config.registration.idHash;
    lifetime = config.registration.lifetime;
    storagePrefix = config.registration.storagePrefix;

    return {
        delAsync,
        getAsync,
        putAsync
    };
};
