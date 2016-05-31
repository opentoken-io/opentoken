"use strict";

module.exports = (config, WebServer) => {
    var webServer;

    webServer = new WebServer(config.server);
    webServer.addRoutes("./route");

    /**
     * Starts the server
     *
     * @return {Promise.<*>}
     */
    return () => {
        return webServer.startServerAsync();
    };
};
