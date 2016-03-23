"use strict";

class HealthCheck {
    constructor(express, config, logger) {
        this.app = express();

        this.app.get("/", (req, res) => {
            res.send("Up and running");
        });

        this.app.listen(config.healthCheck.port, () => {
            logger.info("Health check listening on port " + config.healthCheck.port);
        });
    }
};

module.exports = (container) => {
    container.instance("HealthCheck", HealthCheck);
};