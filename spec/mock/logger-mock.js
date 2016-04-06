"use strict";

class LoggerMock {
    constructor() {
        [
            "console",
            "debug",
            "error",
            "info",
            "warn"
        ].forEach((methodName) => {
            this[methodName] = jasmine.createSpy("logger." + methodName);
        });
    }
};

module.exports = LoggerMock;