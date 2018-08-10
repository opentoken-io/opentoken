"use strict";


/**
 * @typedef {Object} opentoken~genericFormatter
 * @property {Function} formatWithFallback
 */


/**
 * @param {opentoken~ErrorResponse} ErrorResponse
 * @param {restify-errors} restifyErrors
 * @return {opentoken~genericFormatter}
 */
module.exports = (ErrorResponse, restifyErrors) => {
    /**
     * Creates an ErrorResponse object for easy formatting
     *
     * @param {Error} err
     * @return {ErrorResponse}
     */
    function createErrorResponse(err) {
        if (err instanceof restifyErrors.RestError) {
            return new ErrorResponse(err.displayName, "VNjrPetsJp");
        }

        if (err instanceof restifyErrors.HttpError) {
            return new ErrorResponse(err.displayName, "vAVAZv890x");
        }

        return new ErrorResponse(err.toString(), "OVMGEN1j");
    }


    /**
     * Sends a buffer.  This simply sets a header and calls the `done`
     * function.
     *
     * @param {Restify~Request} req
     * @param {Restify~Response} res
     * @param {Buffer} buffer
     * @return {Buffer}
     */
    function sendBuffer(req, res, buffer) {
        res.setHeader("Content-Length", buffer.length);

        return buffer;
    }


    /**
     * Create a formatter that will call a function if it does not know
     * how to format a response.  This only catches errors and the
     * default formatter will be most likely called.
     *
     * @param {Function} defaultTransform Sends a Buffer to a callback
     * @return {Function}
     */
    function formatWithFallback(defaultTransform) {
        /**
         * This is the formatter that catches errors.
         *
         * @param {Restify~Request} req
         * @param {Restify~Response} res
         * @param {*} body
         * @return {*}
         */
        return (req, res, body) => {
            var error;

            if (body instanceof ErrorResponse) {
                res.statusCode = body.statusCode || 500;

                return sendBuffer(req, res, body.toResponseBuffer(req));
            }

            if (body instanceof Error) {
                // All sorts of errors.  This includes all errors from Node
                // as well as Restify errors.
                res.statusCode = body.statusCode || 500;
                error = createErrorResponse(body);

                return sendBuffer(req, res, error.toResponseBuffer(req));
            }

            return defaultTransform(req, res, body);
        };
    }

    return {
        formatWithFallback
    };
};
