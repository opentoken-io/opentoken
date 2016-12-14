"use strict";

/**
 * @param {opentoken~promise} promise
 * @return {opentoken~ErrorResponse}
 */
module.exports = (promise) => {
    /**
     * An error object that will be returned from the API, plus utility
     * functions for copying this object around.
     *
     * @class {opentoken~ErrorResponse}
     */
    class ErrorResponse {
        /**
         * Create a new ErrorResponse.
         *
         * @param {string} message
         * @param {string} [code]
         */
        constructor(message, code) {
            this.message = message;

            if (code) {
                this.code = code;
            } else {
                this.code = "zbrQmkdHi6";
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


        /**
         * Convert to a response JSON object in a Buffer.
         *
         * @param {Restify~Request} req
         * @return {Buffer}
         */
        toResponseBuffer(req) {
            var content, copy;

            // Sanitize
            copy = {
                code: this.code,
                logref: req.logId,
                message: this.message
            };
            content = JSON.stringify(copy);

            return new Buffer(`${content}\n`, "binary");
        }
    }


    ErrorResponse.rejectedPromiseAsync = (message, code) => {
        return promise.reject(new ErrorResponse(message, code));
    };

    return ErrorResponse;
};
