"use strict";

function OtDateMock(d) {
    this.date = d;

    /**
     * Determines if one OtDateMock is before another.
     *
     * Does not quite conform to OtDateMock parameters.
     *
     * @param {OtDateMock} other
     * @return {boolean}
     */
    this.isBefore = jasmine.createSpy("isBefore").andCallFake((other) => {
        return this.date < other.date;
    });


    /**
     * Converts a date to a Buffer that's 4 bytes long
     *
     * @param {Buffer} [dest] If not specified, makes a new Buffer
     * @param {number} [offset] Starting position in the buffer
     * @return {Buffer}
     */
    this.toBuffer = jasmine.createSpy("toBuffer").andCallFake((dest, offset) => {
        if (! dest) {
            dest = new Buffer(4);
            offset = 0;
        }

        dest.writeUInt32LE(Math.floor(this.date.getTime() / 1000), offset);

        return dest;
    });
}

module.exports = {
    /**
     * Convert a buffer to an OtDateMock
     *
     * @param {Buffer} buff
     * @param {number} [offset]
     * @return {OtDateMock}
     */
    fromBuffer: (buff, offset) => {
        var d, t;

        d = new Date();
        t = buff.readUInt32LE(offset);
        d.setTime(t * 1000);

        return new OtDateMock(d);
    },

    /**
     * Creates an OtDateMock from a string
     *
     * @param {string} str
     * @return {OtDateMock}
     */
    fromString: (str) => {
        return new OtDateMock(new Date(str));
    },

    /**
     * Creates an OtDateMock from the current time
     *
     * @return {OtDateMock}
     */
    now: () => {
        return new OtDateMock(new Date());
    }
}
