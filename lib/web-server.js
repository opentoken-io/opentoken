"use strict";

class WebServer {
    /**
     * This is mostly used for dependency injection.
     *
     * @param {Object} fs
     * @param {Object} logger
     * @param {Function} middlewareProfiler
     * @param {Object} promise
     * @param {Object} restify
     * @param {Function} restMiddleware
     */
    constructor(fs, logger, middlewareProfiler, promise, restify, restMiddleware) {
        this.configure({});// Sets this.config, this.restifyConfig
        this.fs = promise.promisifyAll(fs);
        this.logger = logger;
        this.middlewareProfiler = middlewareProfiler;
        this.promise = promise;
        this.restify = restify;
        this.restMiddleware = restMiddleware;
        this.serverPromise = null;  // Filled in by this.app()
    }


    /**
     * Sets up middleware functionality for the web server
     *
     * @param {(string|Function)} a
     * @param {Function} b
     * @return {Promise}
     */
    addMiddleware(a, b) {
        var promise;

        promise = this.app();

        if (arguments.length > 1) {
            return promise.then((server) => {
                this.logger.debug("Adding middleware for route: " + a);
                server.use(a, b);  // path and callback

                return server;
            });
        }

        this.serverPromise = promise.then((server) => {
            this.logger.debug("Adding middleware");
            server.use(a);  // a = callback

            return server;
        });

        return this.serverPromise;
    }


    /**
     * This is used for setting up a verb to be called within the application
     *
     * @param {string} method
     * @param {string} route
     * @param {Function} callback
     * @return {Promise}
     */
    addRoute(method, route, callback) {
        method = method.toLowerCase();

        if (method == "delete") {
            method = "del";
        }

        this.serverPromise = this.app().then((server) => {
            this.logger.debug("Adding route: " + method + " " + route);
            server[method](route, callback);

            return server;
        });

        return this.serverPromise;
    }


    /**
     * Creates the app if not already created.
     *
     * @private
     * @return {Promise.<Restify>}
     */
    app() {
        var promise;

        if (this.serverPromise) {
            return this.serverPromise;
        }

        this.logger.debug("Creating server with config: " + JSON.stringify(this.config));

        if (this.config.https) {
            promise = this.promise.all([
                this.fs.readFileAsync(this.config.certificateFile).then((contents) => {
                    this.restifyConfig.certificate = contents;
                }),
                this.fs.readFileAsync(this.config.keyFile).then((contents) => {
                    this.restifyConfig.key = contents;
                })
            ]);
        } else {
            promise = this.promise.resolve();
        }

        promise = promise.then(() => {
            return this.restify.createServer(this.restifyConfig);
        });

        if (this.config.profileMiddleware) {
            promise = promise.then((server) => {
                this.logger.debug("Profiling middleware");
                this.middlewareProfiler.profileServer(server);
                this.middlewareProfiler.displayAtInterval(10000, this.logger.info.bind(this.logger));

                return server;
            });
        }

        promise = promise.then((server) => {
            this.restMiddleware(this.config, server);

            return server;
        });

        this.serverPromise = promise;

        return promise;
    }


    /**
     * Attaches error handling to the server. This captures different error
     * types, suppresses their output to console or to the client and then they
     * get caught by the Uncaught Exception Handler.
     *
     * @private
     * @param {Restify} server
     */
    attachErrorHandlers(server) {
        server.on("uncaughtException", (req, res, route, error) => {
            this.logger.error("Uncaught Exception: " + error.toString());
            this.logger.console("Uncaught Exception:", error);

            res.send(500);
        });
    }


    /**
     * Sets configuration options.
     *
     * @param {Object} config
     * @return this
     */
    configure(config) {
        // All values go in here and are converted to the right data types
        this.config = {
            baseUrl: config.baseUrl || "",
            certificateFile: config.certificateFile,  // HTTPS CA Chain and certificate
            keyFile: config.keyFile, // HTTPS private key
            https: true,
            name: config.name || "OpenToken API",  // For Server Name fields
            port: +(config.port || 8080), // For listening
            profileMiddleware: !!config.profileMiddleware,
            proxyProtocol: config.proxyProtocol || false,  // boolean or object
            spdy: config.spdy || null,  // Options for node-spdy
            version: config.version || null  // For routes
        };
        config = null;  // For safety - don't use this object any longer

        // Make sure our baseUrl does not end with a slash
        if (this.config.baseUrl.substr(-1) === "/") {
            this.config.baseUrl = this.config.baseUrl.substr(0, this.config.baseUrl.length - 1);
        }

        // Error checking HTTPS options
        if (!this.config.certificateFile || !this.config.keyFile) {
            this.config.certificateFile = null;
            this.config.keyFile = null;
            this.config.https = false;
        }

        // Select values are plucked into this one
        this.restifyConfig = {
            handleUncaughtExceptions: true, // Turning on uncaughtException handling
            handleUpgrades: false,  // Intentionally do not upgrade the connection
            httpsServerOptions: null,  // Could construct this object instead
            name: this.config.name,
            proxyProtocol: this.config.proxyProtocol,
            spdy: this.config.spdy,
            version: this.config.version
        };

        return this;
    }


    /**
     * Starts a web server using the config passed in.
     * Will start a https server if there is information in the
     * config section for key locations.
     *
     * @return this
     */
    startServer() {
        this.logger.debug("Starting server");

        this.serverPromise = this.app().then((server) => {
            this.attachErrorHandlers(server);

            return this.promise.fromCallback((callback) => {
                server.listen(this.config.port, callback);
            }).then(() => {
                this.logger.info("Server listening on port " + this.config.port);
                return server;
            });
        });

        return this.serverPromise;
    }
}

module.exports = WebServer;
