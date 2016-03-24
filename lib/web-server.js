"use strict";

class WebServer {
    constructor(express, logger) {
        this.app = express();
        this.logger = logger;
    }


    /**
     * Sets up middleware functionlality for the web server
     *
     * @param {(string|Function)} a
     * @param {Function} b
     */
    addMiddleware(a, b) {
        if (arguments.length > 1) {
            this.app.use(a, b);  // path and callback
        } else {
            this.app.use(a);  // a = callback
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
        this.app[method](route, callback);
    }


    /**
     * Starts a web server using the config passed in.
     *
     * @param {Object} config
     */
    startServer(config) {
        this.app.listen(config.port, () => {
            this.logger.info("Server listening on port " + config.port);
        });
    }
}

module.exports = (container) => {
    container.singleton("webServer", WebServer);
};