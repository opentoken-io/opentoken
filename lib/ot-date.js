"use strict";

/**
 * Provides functionality to process dates and times in
 * consistent formats. This is useful to keep things in line
 * with each so we can expect dates and times
 * used within the system will be able to be checked without
 * format issues.
 *
 * Also all date and times are in UTC or converted to UTC.
 */

/**
 * Describes an offset used to adjust a date.
 *
 * @typedef {Object} OtDate~spec
 * @property {number} years
 * @property {number} months
 * @property {number} days
 * @property {number} hours
 * @property {number} seconds
 * @property {number} milliseconds
 */

module.exports = (moment) => {
    /**
     * Open Token Date Class to provide simple date functionality
     * using Moment.js. This always uses dates and times in UTC.
     */
    class OtDate {
        /**
         * Creates an instance of OtDate.
         *
         * @param {Moment} m
         */
        constructor(m) {
            if (!(m instanceof moment)) {
                throw new Error("Use helper functions instead");
            }

            this.moment = m.utc();
        }


        /**
         * Checks if the set date/time is before the date/time passed in.
         * Converts to a Date if we get an instance of OtDate.
         *
         * @param {(Date|string|OtDate)} otherDate
         * @return {boolean} whether the date is before
         */
        isBefore(otherDate) {
            if (otherDate instanceof OtDate) {
                otherDate = otherDate.toDate();
            }

            return this.moment.isBefore(otherDate);
        }


        /**
         * Adds time to the set date/time.
         * You can send in multiple parameters to move the date.
         *
         *    {"days": 1, "hours": 5, "seconds": 3}
         *
         * @param {OtDate~spec} spec
         * @return {this}
         */
        plus(spec) {
            this.moment.add(spec);

            return this;
        }


        /**
         * Takes the set time and writes it to a buffer.  It uses 4 bytes
         * and stores the Unix timestamp of the date as a 32 bit little-endian
         * unsigned integer.
         *
         * @param {Buffer} [b] Destination buffer - creates one if not passed
         * @param {number} [offset=0] Where to write in the buffer
         * @return {Buffer}
         */
        toBuffer(b, offset) {
            if (!b) {
                offset = 0;
                b = new Buffer(4);
            }

            b.writeUInt32LE(this.moment.unix(), offset || 0);

            return b;
        }


        /**
         * Returns a Date object representing the date in OtDate
         *
         * @return {Date}
         */
        toDate() {
            return this.moment.toDate();
        }


        /**
         * Converts the internal date/time into an ISO 8601 formatted string.
         *
         *    YYYY-MM-DDTHH:MM:SS.mmmZ
         *
         * @return {string}
         */
        toString() {
            return this.moment.toISOString();
        }
    }


    /**
     * Creates an OtDate from a Buffer.  The offset in the buffer should
     * point to a 4-byte UInt32LE of a Unix timestamp, the same as what is
     * created by an OtDate instance's .toBuffer() method.
     *
     * @param {Buffer} b
     * @param {number} offset
     * @return {OtDate}
     */
    OtDate.fromBuffer = (b, offset) => {
        return new OtDate(moment.unix(b.readUInt32LE(offset || 0)));
    };


    /**
     * Creates an OtDate instance from a Date object.
     *
     * @param {Date} d
     * @return {OtDate}
     */
    OtDate.fromDate = (d) => {
        if (!(d instanceof Date)) {
            throw new Error("Use a date object");
        }

        return new OtDate(moment.utc(d));
    };


    /**
     * Returns a new OtDate object from a parsed string.
     * Prefer to use unambiguous dates using RFC ISO 8601 format.
     *
     *    Examples:
     *        YYYY-MM-DD
     *        YYYY-MM-DDT00:00:00
     *        YYYY-MM-DDT00:00:00.000Z
     *        YYYY-MM-DDT00:00:00.000+0000
     *
     *
     * @param {string} d
     * @return {OtDate}
     */
    OtDate.fromString = (d) => {
        if (typeof d !== "string") {
            throw new Error("Use a string");
        }

        return new OtDate(moment.utc(d));
    };


    /**
     * Creates a new OtDate object that represents the current date/time.
     *
     * @return {OtDate}
     */
    OtDate.now = () => {
        return new OtDate(moment());
    };

    return OtDate;
};
