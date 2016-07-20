"use strict";

module.exports = (config, hash, OtDate, promise, random, storageServiceFactory) => {
    var idLength, storageService;


    /**
     * Creates a new session.
     *
     * @param {string} accountId
     * @return {Promise.<string>} sessionId
     */
    function createAsync(accountId) {
        return random.idAsync(idLength).then((sessionId) => {
            return storageService.putAsync(sessionId, {
                accountId
            }).then(() => {
                return sessionId;
            });
        });
    }


    /**
     * Checks if a session is still active for an account.
     *
     * @param {string} sessionId
     * @param {string} accountId
     * @return {Promise.<*>}
     */
    function validateAsync(sessionId, accountId) {
        if (!sessionId) {
            return promise.reject("No session ID");
        }

        return storageService.getAsync(sessionId).then((data) => {
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
    storageService = storageServiceFactory(config.session.idHash, config.session.lifetime, config.session.storagePrefix);

    return {
        createAsync,
        validateAsync
    };
};
