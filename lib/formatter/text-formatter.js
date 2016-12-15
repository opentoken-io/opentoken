"use strict";


/**
 * @param {opentoken~genericFormatter} genericFormatter
 * @return {Function}
 */
module.exports = (genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body, done) => {
        var content;

        content = "";

        if (body) {
            content = body.toString();
        }

        return done(null, new Buffer(`${content}\n`, "binary"));
    });
};
