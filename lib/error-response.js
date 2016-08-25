"use strict";

module.exports = (config, logger, random) => {
    var idLength;

    /**
     * An error object that will be returned from the API, plus utility
     * functions for copying this object around.
     */
    class ErrorResponse {
        /**
         * Create a new ErrorResponse.
         *
         * @param {string} logref
         * @param {string} message
         * @param {string} [code]
         */
        constructor(logref, message, code) {
            this.logref = logref;
            this.message = message;

            if (code) {
                this.code = code;
            }
        }


        /**
         * Returns the MIME type for this object.
         *
         * @return {string}
         */
        mimeType() {
            return "application/vnd.error+json";
        }
    }


    /**
     * Creates an error object
     *
     * @param {string} message
     * @param {string} [code]
     * @return {Promise.<ErrorResponse>}
     */
    function createAsync(message, code) {
        return random.idAsync(idLength).then((logref) => {
            logger.error(`Exception [${logref}]: ${message}`);

            return new ErrorResponse(logref, message, code);
        });
    }


    /**
     * Creates the ErrorResponse object and rejects the promise.
     *
     * @param {string} message
     * @param {string} [code]
     * @return {Promise.<*>} Always rejected
     */
    function rejectedPromiseAsync(message, code) {
        return createAsync(message, code).then((errorObject) => {
            throw errorObject;
        });
    }


    idLength = config.server.exceptionIdLength;

    return {
        createAsync,
        rejectedPromiseAsync
    };
};
