"use strict";

class WebServer {
    constructor(fs, logger, proxywrap, restify) {
        this.configure({});  // Sets this.config, this.restifyConfig
        this.fs = fs;
        this.logger = logger;
        this.proxywrap = proxywrap;
        this.restify = restify;
        this.server = null;  // Filled in by this.app()
    }


    /**
     * Sets up middleware functionlality for the web server
     *
     * @param {(string|Function)} a
     * @param {Function} b
     */
    addMiddleware(a, b) {
        if (arguments.length > 1) {
            this.logger.debug("Adding middleware for route: " + a);
            this.app().use(a, b);  // path and callback
        } else {
            this.logger.debug("Adding middleware");
            this.app().use(a);  // a = callback
        }
    }


    /**
     * This is used for setting up a verb to be called within the application
     *
     * @param {string} method
     * @param {string} route
     * @param {Function} callback
     */
    addRoute(method, route, callback) {
        this.logger.debug("Adding route: " + method + " " + route);
        this.app()[method](route, callback);
    }


    /**
     * Creates the app if not already created.
     *
     * @return {Express}
     */
    app() {
        if (! this.server) {
            this.logger.debug("Creating server with config: " + JSON.stringify(this.config));
            this.server = this.restify.createServer(this.restifyConfig);
        }

        return this.server;
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
            certificateFile: config.certificateFile,  // HTTPS CA Chain and certificate
            keyFile: config.keyFile, // HTTPS private key
            https: true,
            name: config.name || "OpenToken API",  // For Server Name fields
            port: +(config.port || 8080), // For listening
            proxyProtocol: config.proxyProtocol || false,  // boolean or object
            spdy: config.spdy || null,  // Options for node-spdy
            version: config.version || null  // For routes
        };
        config = null;  // For safety - don't use this object any longer

        // Error checking HTTPS options
        if (!this.config.certificateFile || !this.config.keyFile) {
            this.config.certificateFile = null;
            this.config.keyFile = null;
            this.config.https = false;
        }

        // Select values are plucked into this one
        this.restifyConfig = {
            handleUpgrades: false,  // Intentionally do not upgrade the connection
            httpsServerOptions: null,  // Could construct this object instead
            name: this.config.name,
            proxyProtocol: this.config.proxyProtocol,
            spdy: this.config.spdy,
            version: this.config.version
        };

        if (this.config.https) {
            this.restifyConfig.certificate = this.fs.readFileSync(this.config.certificateFile);
            this.restifyConfig.key = this.fs.readFileSync(this.config.keyFile);
        }

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
        this.app().listen(this.config.port, () => {
            this.logger.info("Server listening on port " + this.config.port);
        });

        return this;
    }
}

module.exports = WebServer;