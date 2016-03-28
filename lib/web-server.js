"use strict";

class WebServer {
    constructor(express, http, https, httpsConfig, logger, proxywrap) {
        this.configure({});
        this.express = express;
        this.http = http;
        this.https = https;
        this.httpsConfig = httpsConfig;
        this.logger = logger;
        this.proxywrap = proxywrap;
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
     * Will start a https server if there is information in the
     * config section for key locations.
     *
     * @return this
     */
    startServer() {
        var transport,transportOptions, server;

        if (this.config.https) {
            transport = this.https;
            transportOptions = this.httpsConfig.getOptions(this.config.https);
            this.logger.info("Enabling SSL");
        } else {
            transport = this.http;
        }

        if (this.config.proxyProtocol) {
            this.logger.info("Enabling Proxy Protocol");
            transport = this.proxywrap.proxy(transport);
        }

        if (this.config.https) {
            server = transport.createServer(transportOptions, this.app());
        } else {
            server = transport.createServer(this.app());
        }

        server.listen(this.config.port, () => {
            this.logger.info("Server listening on port " + this.config.port);
        });

        return this;
    }
}

module.exports = WebServer;