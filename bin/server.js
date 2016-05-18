#!/usr/bin/env node

"use strict";

var config, container, logger;

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

container.resolve("bootstrap")(__dirname + "/..").then(() => {
    // Kick off the server through dependency injection
    container.resolve("apiServer")();
});

