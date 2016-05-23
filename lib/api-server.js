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
    function startServerAsync() {
        return webServer.startServerAsync();
    }

    return startServerAsync;
};
