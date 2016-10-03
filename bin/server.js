#!/usr/bin/env node
"use strict";

/**
 * Returns the usage information.
 *
 * @return {string}
 */
function usageMessage() {
    return `Starts the OpenToken.io server.

Accepts the following arguments:

    --help -h -?               Shows this help message.
    --override=FILE            Override settings in config.json with these.
                               The properties are merged together.

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
    if (args.override) {
        override = require(path.resolve(process.cwd(), args.override));
        config = util.deepMerge(config, override);
    }

    return config;
}


/**
 * The body of the program.
 */
function main() {
    var args, config, container, docopt, logger;

    // Load the dependency injection container.
    container = require("../lib/container");

    // Only load external libraries, no more of our lib/ files for now.
    docopt = container.resolve("docopt");

    // Argument processing.
    args = docopt(usageMessage());

    // When asked, show the help message and quit
    if (args.help) {
        console.log(usageMessage());

        return;
    }

    // Get the configuration
    config = loadConfig(container, args);

    // Other modules may now be loaded.
    logger = container.resolve("logger");

    if (args.override) {
        // Can't log this earlier
        logger.info(`Using overrides from file: ${args.override}`);
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

    // Save the configuration and bootstrap.
    container.register("config", config);
    container.resolve("bootstrap")().then(() => {
        // Kick off the server through dependency injection
        container.resolve("apiServer")();
    });
}

main();
