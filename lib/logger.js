"use strict";

module.exports = (config) => {
    return {
        /**
         * Displays a message to the console only.
         *
         * @param {*} data All parameters are sent to console.log.
         */
        console() {
            var args;

            args = [].slice.call(arguments);
            console.log.apply(console, args);
        },


        /**
         * Logs debug statements to stderr only if
         * debug has been turned on in environment variables
         * or config.
         *
         * @param {string} text
         */
        debug(text) {
            if (config.debug) {
                console.error(`DEBUG: ${text}`);
            }
        },


        /**
         * Logs errors to stderr
         *
         * @param {string} text
         */
        error(text) {
            console.error(`ERROR: ${text}`);
        },


        /**
         * Logs info statements to stdout.
         *
         * @param {string} text
         */
        info(text) {
            console.log(text);
        },


        /**
         * Logs warn statments to stderr.
         *
         * @param {string} text
         */
        warn(text) {
            console.error(`WARN: ${text}`);
        }
    };
};
