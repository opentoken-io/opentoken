"use strict";

module.exports = () => {
    /**
     * Converts a string into a buffer. Does not change the input if it is
     * already a buffer.
     *
     * @param {(Buffer|string)} stringOrBuffer
     * @return {(Buffer|string)}
     */
    function toBuffer(stringOrBuffer) {
        if (!Buffer.isBuffer(stringOrBuffer)) {
            return new Buffer(stringOrBuffer, "binary");
        }

        return stringOrBuffer;
    }


    /**
     * Converts a buffer into a string. Does not change the input if it is
     * already a string.
     *
     * @param {(Buffer|string)} stringOrBuffer
     * @return {(Buffer|string)}
     */
    function toString(stringOrBuffer) {
        if (Buffer.isBuffer(stringOrBuffer)) {
            return stringOrBuffer.toString("binary");
        }

        return stringOrBuffer;
    }

    return {
        toBuffer,
        toString
    };
};
