"use strict";

class WebServer {
    constructor(express, logger) {
        this.app = express();
        this.logger = logger;
    }


    /**
     * This is used for setting up a verb to be called within the application
     *
     * @param {string} method
     * @param {string} route
     * @param {Function} callback
     */
    addRoute(method, route, callback) {
        if (!method || !route) {
            throw new Error("Missing vital arguments to add route");
        }

        this.app[method](route, callback);
    }


    /**
     * Starts a web server using the config passed in.
     *
     * @param {Object} config
     */
    startServer(config) {
        if (!config) {
            throw new Error("No configuration was passed in");
        }

        this.app.listen(config.port, () => {
            this.logger.info("Server listening on port " + config.port);
        });
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
}

module.exports = (container) => {
    container.singleton("webServer", WebServer);
};