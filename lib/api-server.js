"use strict";

class ApiServer {
    constructor(config, logger, webServer) {
        this.webServer = webServer;
        this.webServer.configure(config.server);
        this.webServer.addRoute("get", "/", (req, res, next) => {
            res.setHeader("content-type", "text/plain");
            res.send("API running " + (new Date()) + "\n");
            next();
        });
        this.webServer.startServer();
    }
}

module.exports = ApiServer;
