"use strict";

describe("ApiServer", () => {
    var create;

    beforeEach(() => {
        var ApiServerFactory, WebServerMock;

        ApiServerFactory = require("../lib/api-server");
        WebServerMock = require("./mock/web-server-mock");
        create = (config) => {
            return new (ApiServerFactory(config, WebServerMock));
        };
    });
    it("starts a server", (done) => {
        var apiServer, config, webServer;

        config = {
            server: {
                "baseUrl": "https://localhost:8080/",
                "port": 8443
            }
        };
        apiServer = create(config);
        webServer = apiServer.webServer;
        expect(webServer.config).toBe(config.server);
        expect(apiServer).toEqual(jasmine.any(Object));
        expect(webServer.startServerAsync).not.toHaveBeenCalled();
        apiServer.startServerAsync().then(() => {
            expect(webServer.startServerAsync).toHaveBeenCalled();
        }).then(done, done);
    });
    it("sets up a route", () => {
        var addRouteCallback, apiServer, next, req, res, webServer;

        res = jasmine.createSpyObj("resMock", [
            "send",
            "setHeader"
        ]);
        next = jasmine.createSpy("nextMock");
        apiServer = create({});
        webServer = apiServer.webServer;
        expect(webServer.addRoute).toHaveBeenCalledWith("get", "/", jasmine.any(Function));
        addRouteCallback = webServer.addRoute.mostRecentCall.args[2];
        expect(() => {
            addRouteCallback(req, res, next);
        }).not.toThrow();
        expect(res.setHeader).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });
});
