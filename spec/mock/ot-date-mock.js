"use strict";

/**
 * Fake class to mock OtDate.
 *
 * @param {Date} d Date value to use for mocking
 */
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
     * Adds time to another time.
     *
     * Does not actually add time, but returns the OtDate object as
     * expected.
     *
     * @param {Object} spec
     * @return {OtDate}
     */
    this.plus = jasmine.createSpy("plus").andCallFake(() => {
        return this;
    });


    /**
     * Converts a date to a Buffer that's 4 bytes long
     *
     * @param {Buffer} [dest] If not specified, makes a new Buffer
     * @param {number} [offset] Starting position in the buffer
     * @return {Buffer}
     */
    this.toBuffer = jasmine.createSpy("toBuffer").andCallFake((dest, offset) => {
        if (!dest) {
            dest = new Buffer(4);
            offset = 0;
        }

        dest.writeUInt32LE(Math.floor(this.date.getTime() / 1000), offset);

        return dest;
    });


    /**
     * Converts a date to a string in ISO format.
     *
     *     YYYY-MM_DDTHH:MM:SS.mmmZ
     *
     * @return {string}
     */
    this.toString = jasmine.createSpy("toString").andCallFake(() => {
        return this.date.toISOString();
    });
}

module.exports = () => {
    return {
        /**
         * Convert a buffer to an OtDateMock
         *
         * @param {Buffer} buff
         * @param {number} [offset]
         * @return {OtDateMock}
         */
        fromBuffer: jasmine.createSpy("fromBuffer").andCallFake((buff, offset) => {
            var d, t;

            d = new Date();
            t = buff.readUInt32LE(offset);
            d.setTime(t * 1000);

            return new OtDateMock(d);
        }),

        /**
         * Creates an OtDateMock from a string
         *
         * @param {string} str
         * @return {OtDateMock}
         */
        fromString: jasmine.createSpy("fromString").andCallFake((str) => {
            return new OtDateMock(new Date(str));
        }),

        /**
         * Creates an OtDateMock from the current time
         *
         * @return {OtDateMock}
         */
        now: jasmine.createSpy("now").andCallFake(() => {
            return new OtDateMock(new Date());
        })
    };
};
