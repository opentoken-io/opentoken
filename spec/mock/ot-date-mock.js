"use strict";

module.exports = () => {
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
        this.isBefore = jasmine.createSpy("isBefore").and.callFake((other) => {
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
        this.plus = jasmine.createSpy("plus").and.callFake(() => {
            return this;
        });


        /**
         * Converts a date to a Buffer that's 4 bytes long
         *
         * @param {Buffer} [dest] If not specified, makes a new Buffer
         * @param {number} [offset] Starting position in the buffer
         * @return {Buffer}
         */
        this.toBuffer = jasmine.createSpy("toBuffer").and.callFake((dest, offset) => {
            if (!dest) {
                dest = Buffer.alloc(4);
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
        this.toString = jasmine.createSpy("toString").and.callFake(() => {
            return this.date.toISOString();
        });
    }

    /**
     * Convert a buffer to an OtDateMock
     *
     * @param {Buffer} buff
     * @param {number} [offset]
     * @return {OtDateMock}
     */
    OtDateMock.fromBuffer = jasmine.createSpy("fromBuffer").and.callFake((buff, offset) => {
        var d, t;

        d = new Date();
        t = buff.readUInt32LE(offset);
        d.setTime(t * 1000);

        return new OtDateMock(d);
    });

    /**
     * Creates an OtDateMock from a string
     *
     * @param {string} str
     * @return {OtDateMock}
     */
    OtDateMock.fromString = jasmine.createSpy("fromString").and.callFake((str) => {
        return new OtDateMock(new Date(str));
    });

    /**
     * Creates an OtDateMock from the current time
     *
     * @return {OtDateMock}
     */
    OtDateMock.now = jasmine.createSpy("now").and.callFake(() => {
        return new OtDateMock(new Date());
    });


    /**
     * Return a fixed value for "now".  Used in tests.
     *
     * @return {OtDateMock}
     */
    OtDateMock.stubNow = () => {
        var otDate;

        otDate = OtDateMock.now();
        OtDateMock.now.and.returnValue(otDate);

        return otDate;
    };


    return OtDateMock;
};
