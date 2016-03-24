/* global console */

"use strict";

class Logger {
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