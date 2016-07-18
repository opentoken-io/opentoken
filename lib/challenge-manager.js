"use strict";

/**
 * @typedef {Object} challengeManager~challengeHashConfig
 * @param {string} algorithm
 * @param {string} challengeId
 * @param {string} encoding
 */

module.exports = (config, hash, OtDate, promise, random, storageServiceFactory) => {
    var challengeHashConfig, challengeIdLength, lifetime, storageService;

    /**
     * Loads the list of active challenges
     *
     * @param {string} accountId
     * @return {Promise.<*>}
     */
    function loadListAsync(accountId) {
        return storageService.getAsync(accountId).then(null, () => {
            return [];
        }).then((results) => {
            var now;

            now = OtDate.now();

            return results.filter((element) => {
                if (typeof element !== "object" || !element || !element.expires) {
                    return false;
                }

                return now.isBefore(element.expires);
            });
        });
    }


    /**
     * Writes a list to storage
     *
     * @param {string} accountId
     * @param {Array.<string>} list
     * @return {Promise.<*>}
     */
    function saveListAsync(accountId, list) {
        return storageService.putAsync(accountId, list);
    }


    /**
     * Confirms a challenge-hashed password matches the expected password.
     * When it does, the challenge is removed from the list before this
     * function resolves the promise.
     *
     * @param {string} accountId
     * @param {string} passwordHash Hashed password
     * @param {string} challengeHash passwordHash also hashed with challenge
     * @return {Promise.<boolean>}
     */
    function validateAsync(accountId, passwordHash, challengeHash) {
        // Get the list of challenge IDs and filter them
        return loadListAsync(accountId).then((list) => {
            var allowed;

            allowed = false;
            list = list.filter((challengeItem) => {
                var computed;

                // The filter will determine if the expected hash matches the
                // actual hash.  If so, filter out this challenge ID and set
                // the "allowed" flag to true.
                computed = hash.hash(passwordHash + challengeItem.id, challengeHashConfig);

                if (computed === challengeHash) {
                    allowed = true;

                    // Filter out
                    return false;
                }

                // Preserve
                return true;
            });

            if (allowed) {
                // If we found a match, then the list is also altered.  Save
                // the updated, filtered list.
                return saveListAsync(accountId, list);
            }

            // Nothing matched.  Do not update the list in storage.
            // Do not allow our promise to be resolved.
            // This is not displayed nicely to the API
            // https://github.com/opentoken-io/opentoken/issues/96
            throw new Error("Did not match any known challenge result");
        });
    }


    /**
     * Creates a challenge string.
     *
     * @param {string} accountId
     * @return {Promise.<challengeManager~challengeHashConfig>}
     */
    function createAsync(accountId) {
        return promise.props({
            challengeId: random.idAsync(challengeIdLength),
            list: loadListAsync(accountId)
        }).then((bits) => {
            bits.list.push({
                expires: OtDate.now().plus(lifetime),
                id: bits.challengeId
            });

            return saveListAsync(accountId, bits.list).then(() => {
                return {
                    algorithm: challengeHashConfig.algorithm,
                    encoding: challengeHashConfig.encoding,
                    salt: bits.challengeId
                };
            });
        });
    }


    challengeHashConfig = config.challenge.challengeHash;
    challengeIdLength = config.challenge.idLength;
    lifetime = config.challenge.lifetime;
    storageService = storageServiceFactory(config.challenge.idHash, lifetime, config.challenge.storagePrefix);

    return {
        createAsync,
        validateAsync
    };
};
