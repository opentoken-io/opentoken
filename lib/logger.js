/* global console */

"use strict";

class Logger {
    constructor() {
        // FIXME:  Issue #1 in Dizzy
        return undefined;
    }

    info(text) {
        console.log(text);
    }

    warn(text) {
        console.log("WARN: " + text);
    }
};

module.exports = (container) => {
    container.singleton("logger", Logger);
};