"use strict";


/**
 * @param {opentoken~genericFormatter} genericFormatter
 * @return {Function}
 */
module.exports = (genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body) => {
        var content;

        content = "";

        if (body) {
            content = body.toString();
        }

        return new Buffer(`${content}\n`, "binary");
    });
};
