"use strict";

/**
 * Simulates a storage engine.  Uses process memory only.
 * Great for testing.  Really bad for production.
 *
 * All methods are asynchronous.
 */

module.exports = (logger, promise) => {
    var store;

    /**
     * Deletes a single file from configured bucket.
     *
     * @param {string} filename
     * @return {Promise.<*>} promise
     */
    function deleteAsync(filename) {
        if (store[filename]) {
            logger.debug(`Delete: ${filename}`);
            delete store[filename];

            return promise.resolve();
        }

        return promise.reject(new Error(`No such key: ${filename}`));
    }


    /**
     * Gets a file from our memory store.
     *
     * @param {string} filename
     * @return {Promise.<Buffer>} indicates success/error of operation
     */
    function getAsync(filename) {
        if (store[filename]) {
            logger.debug(`Get: ${filename}`);
            logger.debug(store[filename].toString("hex"));

            return promise.resolve(store[filename]);
        }

        return promise.reject(new Error(`No such key: ${filename}`));
    }


    /**
     * Uploads a file to the memory storage. We always want the data to be a
     * buffer type in binary.
     *
     * @param {string} filename
     * @param {(Buffer|string)} contents
     * @return {Promise.<*>} indicates success/error of operation
     */
    function putAsync(filename, contents) {
        logger.debug(`Put: ${filename}`);
        logger.debug(contents.toString("hex"));
        store[filename] = contents;

        return promise.resolve();
    }


    store = {};

    return {
        deleteAsync,
        getAsync,
        putAsync
    };
};
