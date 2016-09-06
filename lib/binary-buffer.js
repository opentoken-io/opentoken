"use strict";

module.exports = () => {
    /**
     * Converts a string into a buffer. Does not change the input if it is
     * already a buffer.
     *
     * @param {(Buffer|string)} stringOrBuffer
     */
    function toBuffer(stringOrBuffer) {
        if (!Buffer.isBuffer(stringOrBuffer)) {
            stringOrBuffer = new Buffer(stringOrBuffer.toString(), "binary");
        }
    }


    /**
     * Converts a buffer into a string. Does not change the input if it is
     * already a string.
     *
     * @param {(Buffer|string)} stringOrBuffer
     */
    function toString(stringOrBuffer) {
        if (Buffer.isBuffer(stringOrBuffer)) {
            stringOrBuffer = stringOrBuffer.toString("binary");
        }
    }

    return {
        toBuffer,
        toString
    };
};
