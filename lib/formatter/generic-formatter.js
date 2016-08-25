"use strict";

module.exports = (errorResponse) => {
    /**
     * Sends a buffer.  This simply sets a header and calls the `done`
     * function.
     *
     * @param {Restify~Request} req
     * @param {Restify~Response} res
     * @param {Buffer} buffer
     * @param {Function} done
     */
    function sendBuffer(req, res, buffer, done) {
        res.setHeader("Content-Length", buffer.length);
        done(null, buffer);
    }


    /**
     * Formats an ErrorResponse object (or one similar to it) into a
     * Buffer.
     *
     * There are no guarantees that the incoming object is an instance of
     * ErrorResponse, but it should act like one.
     *
     * @param {Restify~Request} req
     * @param {Restify~Response} res
     * @param {Object} error
     * @param {Function} done
     */
    function formatAndSendError(req, res, error, done) {
        var copy, string;

        // Santize
        copy = {
            logref: error.logref,
            message: error.message
        };

        if (error.code) {
            copy.code = error.code;
        }

        string = JSON.stringify(copy);

        sendBuffer(req, res, new Buffer(`${string}\n`, "binary"), done);
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
         * @param {Function} done
         */
        return (req, res, body, done) => {
            if (body instanceof Error) {
                res.statusCode = body.statusCode || 500;

                errorResponse.createAsync(body.toString(), "OVMGEN1j").then((error) => {
                    formatAndSendError(req, res, error, done);
                });
            } else if (body.logref && body.message) {
                formatAndSendError(req, res, body, done);
            } else {
                defaultTransform(req, res, body, (err, buffer) => {
                    if (err) {
                        done(err);
                    } else {
                        sendBuffer(req, res, buffer, done);
                    }
                });
            }
        };
    }

    return {
        formatWithFallback
    };
};
