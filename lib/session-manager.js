"use strict";

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
     * Verifies an account ID and a session ID are not empty.
     *
     * @param {string} accountId
     * @param {string} sessionId
     * @return {Promise.<*>}
     */
    function checkBothAsync(accountId, sessionId) {
        return checkAccountIdAsync(accountId).then(() => {
            if (!sessionId) {
                throw new Error("Session ID must not be empty");
            }
        });
    }


    /**
     * Creates a new session.
     *
     * @param {string} accountId
     * @return {Promise.<string>} sessionId
     */
    function createAsync(accountId) {
        return checkAccountIdAsync(accountId).then(() => {
            return random.idAsync(idLength);
        }).then((sessionId) => {
            return storageService.putAsync([
                accountId,
                sessionId
            ], {
                accountId
            }).then(() => {
                return sessionId;
            });
        });
    }


    /**
     * Destroys a session.
     *
     * @param {string} accountId
     * @param {string} sessionId
     * @return {Promise.<*>}
     */
    function deleteAsync(accountId, sessionId) {
        return checkBothAsync(accountId, sessionId).then(() => {
            return storageService.deleteAsync([
                accountId,
                sessionId
            ]);
        });
    }


    /**
     * Checks if a session is still active for an account.
     *
     * @param {string} accountId
     * @param {string} sessionId
     * @return {Promise.<*>}
     */
    function validateAsync(accountId, sessionId) {
        return checkBothAsync(accountId, sessionId).then(() => {
            return storageService.getAsync([
                accountId,
                sessionId
            ]);
        }).then((data) => {
            if (data.accountId !== accountId) {
                throw new Error("Session is for wrong account");
            }

            // Refresh the session in the background, which is
            // why the promise here is not returned.
            storageService.putAsync(sessionId, {
                accountId
            });
        });
    }


    idLength = config.session.idLength;
    storageService = storageServiceFactory([
        config.account.idHash,
        config.session.idHash
    ], config.session.lifetime, config.session.storagePrefix);

    return {
        createAsync,
        deleteAsync,
        validateAsync
    };
};
