"use strict";

class HealthCheck {
    constructor(webServer, config) {
        webServer.addRoute("get", "/", (req, res) => {
            res.send("Health Check Up and running");
        });
        webServer.startServer(config.healthCheck);
    }
};

module.exports = (container) => {
    container.instance("HealthCheck", HealthCheck);
};