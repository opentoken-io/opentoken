"use strict";

module.exports = function (moment) {
    /**
     * Open Token Date Class to provide simple date functionality
     * using Moment.js.
     *
     * @param {Moment} m
     */
    class OtDate {
        constructor(m) {
            if (! (m instanceof moment)) {
                throw new Error("Use helper functions instead");
            }

            this.moment = m.utc();
        }


        /**
         * Checks if the set time is before the time passed in.
         *
         * @param {Date} otherDate
         * @return {boolean} whether the date is before
         */
        isBefore(otherDate) {
            return this.moment.isBefore(otherDate);
        }


        /**
         * Adds time to the set time.
         * You can send in multiple parameters to move the date up.
         *
         *    {"days": 1, "hours": 5, "seconds": 3}
         *
         * @param {Object} spec
         * @return {Moment}
         */
        plus(spec) {
            return this.moment.add(spec);
        }


         /**
         * Takes the set time and writes it to a buffer
         *
         * @return {Buffer}
         */
        toBuffer() {
            var b;

            b = new Buffer(4);
            b.writeUInt32LE(this.moment.unix(), 0);

            return b;
        }


        /**
         * Gets the date from the set moment.
         *
         * @return {string}
         */
        toDate() {
            return this.moment.toDate();
        }


        /**
         * Gets the set moment and returns a formatted string.
         *
         * @return {string} set time formatted in ISO 8601 format
         */
        toString() {
            return this.moment.toString(this.moment.ISO_8601);
        }
    };


    /**
     * Sets a time from a buffer on the OtDate class.
     *
     * @return {OtDate}
     */
    OtDate.fromBuffer = (b) => {
        return new OtDate(new moment().unix(b.readUInt32LE(0)));
    };


    /**
     * Sets a passed in time on the OtDate class.
     *
     * @return {OtDate}
     */
    OtDate.fromDate = (d) => {
        return new OtDate(new moment(d));
    };


    /**
     * Sets the current date/time of the server on the OtDate class.
     *
     * @return {OtDate}
     */
    OtDate.now = () => {
        return new OtDate(new moment());
    };

    return OtDate;
};