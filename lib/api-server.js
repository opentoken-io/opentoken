"use strict";

class ApiServer {
    constructor(config, webServer) {
        this.webServer = webServer;
        this.webServer.configure(config.server);
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

module.exports = ApiServer;
