"use strict";

module.exports = (config, WebServer) => {
    class ApiServer {
        constructor() {
            this.webServer = new WebServer(config.server);
            this.webServer.addRoute("get", "/", (req, res, next) => {
                res.setHeader("content-type", "text/plain");
                res.send("API running " + (new Date()) + "\n");
                next();
            });
        }

        /**
         * Starts the server
         *
         * @return {Promise}
         */
        startServerAsync() {
            return this.webServer.startServerAsync();
        }
    }

    return ApiServer;
}
