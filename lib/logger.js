/* global console */

"use strict";

class Logger {
    constructor(config) {
        this.config = config;
    }

    /**
     * Logs debug statements to stderr only if
     * debug has been turned on in environment variables
     * or config.
     *
     * @param {string} text
     */
    debug(text) {
        if (this.config.debug) {
            console.error("DEBUG: " + text);
        }
    }


    /**
     * Logs errors to stderr
     *
     * @param {string} text
     */
    error(text) {
        console.error("ERROR: " + text);
    }


    /**
     * Logs info statements to stdout.
     *
     * @param {string} text
     */
    info(text) {
        console.log(text);
    }


    /**
     * Logs warn statments to stderr.
     *
     * @param {string} text
     */
    warn(text) {
        console.error("WARN: " + text);
    }
};

module.exports = Logger;