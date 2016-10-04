#!/usr/bin/env node
"use strict";

/**
 * Returns the usage information.
 *
 * @return {string}
 */
function usageMessage() {
    return `Starts the OpenToken.io server.

Usage: server.js [options]

Options:

    --help, -h, -?   Shows this help message.
    --override FILE  Override settings in config.json with these.  The
                     properties are merged together.

Examples:

    # Starts the server using only config.json.
    ./server.js

    # Starts the server using config.json plus an override file.
    ./server.js --override=sensitive-settings.json`;
}


/**
 * Loads the configuration
 *
 * @param {Dizzy} container
 * @param {Object} args
 * @return {Object} config
 */
function loadConfig(container, args) {
    var config, override, path, util;

    path = container.resolve("path");
    util = container.resolve("util");
    config = require("../config.json");

    // Allow overrides from an external config file.
    if (args["--override"]) {
        override = require(path.resolve(process.cwd(), args["--override"]));
        config = util.deepMerge(config, override);
    }

    return config;
}


/**
 * The body of the program.
 */
function main() {
    var args, config, container, logger, neodoc;

    // Load the dependency injection container.
    container = require("../lib/container");

    // Only load external libraries, no more of our lib/ files for now.
    neodoc = container.resolve("neodoc");

    // Argument processing and handle --help.
    args = neodoc.run(usageMessage());

    // Get the configuration and save in container.
    config = loadConfig(container, args);
    container.register("config", config);

    // Other modules may now be loaded.
    logger = container.resolve("logger");

    if (args["--override"]) {
        // Was not able to log this earlier.
        logger.info(`Using overrides from file: ${args["--override"]}`);
    }

    // Allow overriding of the port.
    if (process.env.PORT) {
        logger.info(`Environment variable overriding port (was ${config.server.port}, is now ${process.env.PORT})`);
        config.server.port = +process.env.PORT;
    }

    // Enable debugging with an environment variable.
    if (process.env.DEBUG) {
        logger.info("Environment variable DEBUG was set. DEBUG is on!");
        config.debug = true;
    }

    // Bootstrap.
    container.resolve("bootstrap")().then(() => {
        // Kick off the server through dependency injection
        container.resolve("apiServer")();
    });
}

main();
