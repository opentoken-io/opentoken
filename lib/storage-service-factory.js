"use strict";

/**
 * Supplies a mechanism to the managers for simpler put/get/delete
 * operations when using an ID as both the encryption key and the source
 * for the hash that's used for the storage service.
 */

module.exports = (OtDate, promise, record, secureHash, storage) => {
    /**
     * Factory that generates a generic service that accesses storage.
     *
     * @param {secureHash~config} hashConfig
     * @param {OtDate~spec} lifetime
     * @param {string} storagePrefix
     * @return {Function}
     */
    return (hashConfig, lifetime, storagePrefix) => {
        /**
         * Returns the key used in storage for a given record ID
         *
         * @param {string} id
         * @return {Promise.<string>} full key to use in storage engine
         */
        function storageKeyAsync(id) {
            return secureHash.hashAsync(id, hashConfig).then((hashedId) => {
                return storagePrefix + hashedId;
            });
        }


        /**
         * Delete a registration file
         *
         * @param {string} id
         * @return {Promise.<*>}
         */
        function delAsync(id) {
            return storageKeyAsync(id).then((storageKey) => {
                return storage.delAsync(storageKey);
            });
        }


        /**
         * Retrieves your data
         *
         * @param {string} id
         * @return {Promise.<*>} Original data
         */
        function getAsync(id) {
            return storageKeyAsync(id).then((storageKey) => {
                return storage.getAsync(storageKey);
            }).then((frozen) => {
                return record.thawAsync(frozen, id);
            });
        }


        /**
         * Saves data
         *
         * @param {string} id
         * @param {*} data
         * @param {*} metadata
         * @return {Promise.<*>}
         */
        function putAsync(id, data, metadata) {
            var options;

            options = {
                expires: OtDate.now().plus(lifetime)
            };

            return promise.props({
                frozen: record.freezeAsync(data, id, options, metadata),
                storageKey: storageKeyAsync(id)
            }).then((bits) => {
                return storage.putAsync(bits.storageKey, bits.frozen, options);
            });
        }


        return {
            delAsync,
            getAsync,
            putAsync
        };
    };
};
