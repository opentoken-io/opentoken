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
    function startServerAsync() {
        return webServer.startServerAsync();
    }

    return startServerAsync;
}
