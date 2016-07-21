"use strict";

module.exports = (config, promise, random, storageServiceFactory) => {
    var idLength, storageService;


    /**
     * Creates a new session.
     *
     * @param {string} accountId
     * @return {Promise.<string>} sessionId
     */
    function createAsync(accountId) {
        return random.idAsync(idLength).then((sessionId) => {
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
    function destroyAsync(accountId, sessionId) {
        return storageService.delAsync([
            accountId,
            sessionId
        ]);
    }


    /**
     * Checks if a session is still active for an account.
     *
     * @param {string} accountId
     * @param {string} sessionId
     * @return {Promise.<*>}
     */
    function validateAsync(accountId, sessionId) {
        if (!sessionId) {
            return promise.reject("No session ID");
        }

        return storageService.getAsync([
            accountId,
            sessionId
        ]).then((data) => {
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
        destroyAsync,
        validateAsync
    };
};
