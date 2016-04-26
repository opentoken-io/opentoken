"use strict";

var ApiServer, config, container, logger;

container = require("../lib/dependencies");

// Initialize the server
config = container.resolve("config");
logger = container.resolve("logger");

// Allow overriding of the port
if (process.env.PORT) {
    logger.info("Environment variable overriding port (was " + config.server.port + ", is now " + process.env.PORT + ")");
    config.server.port = process.env.PORT;
}

if (process.env.DEBUG) {
    logger.info("Environment variable DEBUG was set. DEBUG is on!");
    config.debug = true;
}

ApiServer = container.resolve("apiServer");
(new ApiServer()).startServerAsync();
