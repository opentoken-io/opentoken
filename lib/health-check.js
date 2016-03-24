"use strict";

class HealthCheck {
    constructor(webServer, config) {
        webServer.startServer(config.healthCheck);
        webServer.addRoute("get", "/", (req, res) => {
            res.send("Health Check Up and running");
        });
    }
};

module.exports = (container) => {
    container.instance("HealthCheck", HealthCheck);
};