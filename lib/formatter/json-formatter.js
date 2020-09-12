"use strict";


/**
 * @param {opentoken~genericFormatter} genericFormatter
 * @return {Function}
 */
module.exports = (genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body) => {
        var content;

        if (Buffer.isBuffer(body)) {
            content = body.toString("base64");
        } else if (body) {
            content = JSON.stringify(body);
        } else {
            content = "null";
        }

        return Buffer.from(`${content}\n`, "binary");
    });
};
