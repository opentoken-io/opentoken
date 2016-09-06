"use strict";

module.exports = (binaryBuffer, genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body, done) => {
        body = binaryBuffer.toBuffer(body);

        done(null, body);
    });
};
