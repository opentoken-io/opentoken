"use strict";

/**
 * @param {opentoken~logger} logger
 * @param {opentoken~promise} promise
 * @return {opentoken~email}
 */
module.exports = (logger, promise) => {
    /**
     * Pretends to send an email using a template and additional data.
     *
     * @param {string} recipient
     * @param {string} subject
     * @param {string} text
     * @param {string} html
     * @return {Promise.<*>}
     */
    function sendAsync(recipient, subject, text) {
        logger.info(`Email ${recipient}: ${subject}\n${text}`);

        return promise.resolve();
    }

    return {
        sendAsync
    };
};
