"use strict";

/**
 * Supplies a mechanism to the managers for simpler put/get/delete
 * operations when using an ID as both the encryption key and the source
 * for the hash that's used for the storage service.
 */

/**
 * @typedef {Object} storageServiceFactory~recordOptions
 * @property {OtDate} expires Expiration date of the record
 */

module.exports = (hash, OtDate, promise, record, storage, util) => {
    /**
     * Factory that generates a generic service that accesses storage.
     *
     * @param {(Array.<hash~deriveConfig>|hash~deriveConfig)} hashConfig
     * @param {OtDate~spec} lifetime
     * @param {string} storagePrefix
     * @return {Function}
     */
    return (hashConfig, lifetime, storagePrefix) => {
        /**
         * Returns the encryption key for the record.  When passed a string,
         * this simply returns the string.  Otherwise this will return the
         * last item in the array.
         *
         * @param {(Array.<string>|string)} id
         * @return {string}
         */
        function getEncryptionKey(id) {
            if (Array.isArray(id)) {
                return id[id.length - 1];
            }

            return id;
        }


        /**
         * Returns the key used in storage for a given record ID
         *
         * @param {(Array.<string>|string)} id
         * @return {Promise.<string>} full key to use in storage engine
         */
        function storageKeyAsync(id) {
            var promises;

            promises = [];

            // Typecast to an Array
            [].concat(id).forEach((idChunk, index) => {
                promises.push(promise.try(() => {
                    if (!idChunk) {
                        throw new Error(`Empty ID for storage key, index ${index}`);
                    }

                    return hash.deriveAsync(idChunk, hashConfig[index % hashConfig.length]);
                }));
            });

            return promise.all(promises).then((hashedIdChunks) => {
                return storagePrefix + hashedIdChunks.join("/");
            });
        }


        /**
         * Delete a registration file
         *
         * @param {(Array.<string>|string)} id
         * @return {Promise.<*>}
         */
        function deleteAsync(id) {
            return storageKeyAsync(id).then((storageKey) => {
                return storage.deleteAsync(storageKey);
            });
        }


        /**
         * Retrieves your data
         *
         * @param {(Array.<string>|string)} id
         * @return {Promise.<*>} Original data
         */
        function getAsync(id) {
            return storageKeyAsync(id).then((storageKey) => {
                return storage.getAsync(storageKey);
            }).then((frozen) => {
                return record.thawAsync(frozen, getEncryptionKey(id));
            });
        }


        /**
         * Saves data
         *
         * @param {(Array.<string>|string)} id
         * @param {*} data
         * @param {*} metadata
         * @return {Promise.<storageServiceFactory~recordOptions>}
         */
        function putAsync(id, data, metadata) {
            var options;

            options = {
                expires: OtDate.now().plus(lifetime)
            };

            return promise.props({
                frozen: record.freezeAsync(data, getEncryptionKey(id), options, metadata),
                storageKey: storageKeyAsync(id)
            }).then((bits) => {
                return storage.putAsync(bits.storageKey, bits.frozen, options);
            }).then(() => {
                return options;
            });
        }


        // Typecast hashConfig to an array after cloning it
        hashConfig = util.clone(hashConfig);
        hashConfig = [].concat(hashConfig);

        return {
            deleteAsync,
            getAsync,
            putAsync
        };
    };
};
