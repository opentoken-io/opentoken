"use strict";

describe("ApiServer", () => {
    var apiServerFactory, WebServerMock;

    beforeEach(() => {
        apiServerFactory = require("../lib/api-server");
        WebServerMock = require("./mock/web-server-mock");
    });
    it("starts a server", (done) => {
        var apiServer, config;

        config = {
            server: {
                "baseUrl": "https://localhost:8080/",
                "port": 8443
            }
        };
        apiServer = apiServerFactory(config, WebServerMock);
        expect(apiServer).toEqual(jasmine.any(Function));
        expect(WebServerMock.mostRecentInstance.startServerAsync).not.toHaveBeenCalled();
        apiServer().then(() => {
            expect(WebServerMock.mostRecentInstance.startServerAsync).toHaveBeenCalled();
        }).then(done, done);
    });
    it("sets up a route", () => {
        apiServerFactory({}, WebServerMock);
        expect(WebServerMock.mostRecentInstance.addRoutes).toHaveBeenCalledWith("./route");
    });
});
