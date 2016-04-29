"use strict";

module.exports = (config, WebServer) => {
    var webServer;

    webServer = new WebServer(config.server);
    webServer.addRoutes("./routes");

    /**
     * Starts the server
     *
     * @return {Promise.<*>}
     */
    function startServer() {
        return webServer.startServerAsync();
    }

    return startServer;
}
