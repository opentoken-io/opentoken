"use strict";

class ApiServer {
    constructor(logger) {
        logger.warn("Not starting API server");
    }
};

module.exports = (container) => {
    container.instance("ApiServer", ApiServer);
};