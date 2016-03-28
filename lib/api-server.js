"use strict";

class ApiServer {
    constructor(config, logger, webServer) {
        this.webServer = webServer;
        this.webServer.configure(config.server);
        this.webServer.addRoute("get", "/", (req, res) => {
            res.send("API running " + (new Date()).toString());
        });
        this.webServer.startServer();
    }
};

module.exports = ApiServer;