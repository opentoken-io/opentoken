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

        if (process.env.DEBUG) {
            logger[methodName].and.callFake((x) => {
                console.log(x);
            });
        }
    });

    return logger;
};
