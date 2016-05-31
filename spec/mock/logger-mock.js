"use strict";

module.exports = () => {
    var logger;

    logger = {};
    [
        "console",
        "debug",
        "error",
        "info",
        "warn"
    ].forEach((methodName) => {
        logger[methodName] = jasmine.createSpy(`logger.${methodName}`);
    });

    return logger;
};
