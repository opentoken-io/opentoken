"use strict";


/**
 * @param {opentoken~binaryBuffer} binaryBuffer
 * @param {opentoken~genericFormatter} genericFormatter
 * @return {Function}
 */
module.exports = (binaryBuffer, genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body) => {
        body = binaryBuffer.toBuffer(body);

        return body;
    });
};
