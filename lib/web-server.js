"use strict";

module.exports = (container, fs, logger, MiddlewareProfiler, promise, restify, restifyRouterMagicAsync, restMiddleware) => {
    /**
     * A configured web server, able to serve files from a configurable route
     * folder.
     */
    class WebServer {
        /**
         * Creates a WebServer object.
         *
         * @param {Object} config Used to configure how the web server works
         */
        constructor(config) {
            // Sets this.config, this.restifyConfig
            this.configure(config);
            this.contracts = [
                this.standardRestMiddleware(),
                this.attachErrorHandlers()
            ];
        }


        /**
         * Adds a contract so when the server is created then additional
         * functionality is added to the server, such as routes and middleware.
         *
         * @private
         * @param {Function} fn
         */
        addContract(fn) {
            this.contracts.push(fn);
        }


        /**
         * Sets up middleware functionality for the web server
         *
         * @param {(string|Function)} a
         * @param {Function} b
         * @return {this}
         */
        addMiddleware(a, b) {
            if (arguments.length > 1) {
                this.addContract((server) => {
                    logger.debug(`Adding middleware for route: ${a}`);

                    // a is path, b is callback
                    server.use(a, b);

                    return server;
                });
            } else {
                this.addContract((server) => {
                    logger.debug("Adding middleware");

                    // a is callback
                    server.use(a);

                    return server;
                });
            }

            return this;
        }


        /**
         * This is used for setting up a verb to be called within the
         * application.
         *
         * @param {string} routesPath
         * @return {this}
         */
        addRoutes(routesPath) {
            this.addContract((server) => {
                return restifyRouterMagicAsync(server, {
                    indexWithSlash: "never",
                    options: {
                        container
                    },
                    routesMatch: "**/!(_)*.js",
                    routesPath
                }).then(() => {
                    return server;
                });
            });

            return this;
        }


        /**
         * Creates the app if not already created.
         *
         * @private
         * @return {Promise.<Restify>}
         */
        app() {
            var promiseResult;

            logger.debug(`Creating server with config: ${JSON.stringify(this.config)}`);

            if (this.config.https) {
                promiseResult = promise.all([
                    fs.readFileAsync(this.config.certificateFile).then((contents) => {
                        this.restifyConfig.certificate = contents;
                    }),
                    fs.readFileAsync(this.config.keyFile).then((contents) => {
                        this.restifyConfig.key = contents;
                    })
                ]);
            } else {
                promiseResult = promise.resolve();
            }

            promiseResult = promiseResult.then(() => {
                return restify.createServer(this.restifyConfig);
            });

            return promiseResult;
        }


        /**
         * Attaches error handling to the server. This captures different error
         * types, suppresses their output to console or to the client and then they
         * get caught by the Uncaught Exception Handler.
         *
         * @private
         * @return {Function}
         */
        attachErrorHandlers() {
            return (server) => {
                server.on("uncaughtException", (req, res, route, error) => {
                    logger.error(`Uncaught Exception: ${error.toString()}`);
                    logger.console("Uncaught Exception:", error);

                    res.send(500);
                });

                return server;
            };
        }


        /**
         * Sets configuration options.
         *
         * @param {Object} config
         * @return {this}
         */
        configure(config) {
            if (!config || typeof config !== "object") {
                config = {};
            }

            // All values go in here and are converted to the right data types
            this.config = {
                baseUrl: config.baseUrl,

                // HTTPS CA Chain and certificate
                certificateFile: config.certificateFile,

                // HTTPS private key
                keyFile: config.keyFile,
                https: config.certificateFile && config.keyFile,

                // For "Server Name" fields
                name: config.name || "OpenToken API",

                // Port for listening
                port: +(config.port || 8080),
                profileMiddleware: !!config.profileMiddleware,

                // Boolean or object
                proxyProtocol: config.proxyProtocol || false,

                // Options for node-spdy
                spdy: config.spdy || null
            };

            // For safety, we don't use the original object any longer.
            config = null;

            // Select values are plucked into this one
            this.restifyConfig = {
                formatters: {
                    "image/png; q=0.1": (req, res, body, next) => {
                        if (body instanceof Error) {
                            res.statusCode = body.statusCode || 500;
                        }

                        if (!Buffer.isBuffer(body)) {
                            body = new Buffer(body.toString());
                        }

                        return next(null, body);
                    }
                },

                // Turning on uncaughtException handling
                handleUncaughtExceptions: true,

                // Intentionally do not upgrade the connection
                handleUpgrades: false,

                // Could construct this object instead
                httpsServerOptions: null,
                name: this.config.name,
                proxyProtocol: this.config.proxyProtocol,
                spdy: this.config.spdy
            };

            return this;
        }


        /**
         * Starts the server listening.  This is intentionally the last bit
         * done to the server so that everything is initialized before we open
         * the port and accept requests.
         *
         * @param {number} port
         * @return {Function}
         */
        listen(port) {
            return (server) => {
                return promise.fromCallback((callback) => {
                    server.listen(port, callback);
                }).then(() => {
                    logger.info(`Server listening on port ${port}`);

                    return server;
                });
            };
        }


        /**
         * Adds middleware to profile the middleware.
         *
         * @private
         * @return {Function}
         */
        profileMiddleware() {
            return (server) => {
                var profiler;

                logger.debug("Profiling middleware");
                profiler = new MiddlewareProfiler();
                profiler.profileServer(server);
                profiler.displayAtInterval(10000, logger.info.bind(logger));

                return server;
            };
        }


        /**
         * Includes standard REST middleware from the restMiddleware library
         *
         * @private
         * @return {Function}
         */
        standardRestMiddleware() {
            return (server) => {
                restMiddleware(this.config, server);

                return server;
            };
        }


        /**
         * Starts a web server using the config passed in.
         * Will start a https server if there is information in the
         * config section for key locations.
         *
         * @return {Promise.<*>}
         */
        startServerAsync() {
            var promiseResult;

            logger.debug("Starting server");

            // Chain the promises on promiseResult
            promiseResult = this.app();

            // If profiling, let the profiler attach first
            if (this.config.profileMiddleware) {
                promiseResult = promiseResult.then(this.profileMiddleware());
            }

            // Now all of the added middleware
            this.contracts.forEach((contract) => {
                promiseResult = promiseResult.then(contract);
            });

            // Finally, we wrap up with listening to the port.
            promiseResult = promiseResult.then(this.listen(this.config.port));

            return promiseResult;
        }
    }

    return WebServer;
};
