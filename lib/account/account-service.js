"use strict";

/**
 * Handles the creating, deletion, and updating of account and
 * registration files.
 *
 * @param {Object} config
 * @param {Object} OtDate Helper object and Object class, like Date
 * @param {Object} record
 * @param {Object} storage
 * @return {Function} factory
 */
module.exports = (config, OtDate, record, storage) => {
    var lifetime, storagePrefix;


    /**
     * Returns the key used in storage for a given record ID
     *
     * @param {string} recordId
     * @return {string} full key to use in storage engine
     */
    function storageKey(recordId) {
        return storagePrefix + recordId;
    }


    /**
     * Delete a registration file
     *
     * @param {string} recordId
     * @return {Promise.<*>}
     */
    function delAsync(recordId) {
        return storage.delAsync(storageKey(recordId));
    }


    /**
     * Retrieves your data
     *
     * @param {string} recordId
     * @param {(Buffer|string)} innerEncryptionKey
     * @return {Promise.<*>} Original data
     */
    function getAsync(recordId, innerEncryptionKey) {
        return storage.getAsync(storageKey(recordId)).then((frozen) => {
            return record.thawAsync(frozen, innerEncryptionKey);
        });
    }


    /**
     * Saves data
     *
     * @param {string} recordId
     * @param {(Buffer|string)} innerEncryptionKey
     * @param {*} data
     * @param {*} metadata
     * @return {Promise.<*>}
     */
    function putAsync(recordId, innerEncryptionKey, data, metadata) {
        var options;

        options = {
            expires: OtDate.now().plus(lifetime)
        };

        return record.freezeAsync(data, innerEncryptionKey, options, metadata).then((frozen) => {
            return storage.putAsync(storageKey(recordId), frozen, options);
        });
    }

    return {
        delAsync,
        getAsync,
        putAsync
    };
};
