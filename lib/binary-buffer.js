"use strict";

module.exports = () => {
    /**
     * Converts a string into a buffer. Does not change the input if it is
     * already a buffer.
     *
     * @param {(string|buffer)} stringOrBuffer
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
     * @param {(string|buffer)} stringOrBuffer
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
