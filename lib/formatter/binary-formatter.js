"use strict";

module.exports = (binaryBuffer, genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body, done) => {
        binaryBuffer.toBuffer(body);

        done(null, body);
    });
};
