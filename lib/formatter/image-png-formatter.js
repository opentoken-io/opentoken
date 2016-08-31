"use strict";

module.exports = (genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body, done) => {
        if (!Buffer.isBuffer(body)) {
            body = new Buffer(body.toString(), "binary");
        }

        done(null, body);
    });
};
