"use strict";


/**
 * @param {opentoken~ErrorResponse} ErrorResponse
 * @param {opentoken~genericFormatter} genericFormatter
 * @return {Function}
 */
module.exports = (ErrorResponse, genericFormatter) => {
    // The default function here should not be called because this content
    // type should be handled by genericFormatter.  So, if execution does
    // come to this function then I don't know what `body` really is.
    return genericFormatter.formatWithFallback((req, res, body, done) => {
        var err;

        err = new ErrorResponse("Unknown error", "4qsTYJa3");
        done(null, err.toResponseBuffer(req));
    });
};
