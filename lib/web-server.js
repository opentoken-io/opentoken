"use strict";

class WebServer {
    constructor(express, logger, proxywrap, http) {
        this.http = http;
        this.proxywrap = proxywrap;
        this.express = express;
        this.logger = logger;
        this.configure({});
    }


    /**
     * Sets up middleware functionlality for the web server
     *
     * @param {(string|Function)} a
     * @param {Function} b
     */
    addMiddleware(a, b) {
        if (arguments.length > 1) {
            this.app().use(a, b);  // path and callback
        } else {
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
        this.app()[method](route, callback);
    }


    /**
     * Creates the app if not already created.
     *
     * @return {Express}
     */
    app() {
        if (! this.application) {
            if (this.config.proxyProtocol) {
                this.proxywrap.proxy(this.http);
            }

            this.application = this.express();
        }

        return this.application;
    }


    /**
     * Sets configuration options.
     *
     * @param {Object} config
     * @return this
     */
    configure(config) {
        this.config = {
            port: +(config.port || 8080),
            proxyProtocol: config.proxyProtocol || false
        };

        return this;
    }


    /**
     * Starts a web server using the config passed in.
     *
     * @return this
     */
    startServer() {
        this.app().listen(this.config.port, () => {
            this.logger.info("Server listening on port " + this.config.port);
        });

        return this;
    }
}

module.exports = (container) => {
    container.instance("webServer", WebServer);
};