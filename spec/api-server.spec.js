"use strict";

describe("ApiServer", () => {
    var ApiServer, webServerMock;

    beforeEach(() => {
        ApiServer = require("../lib/api-server");
        webServerMock = jasmine.createSpyObj("webServerMock", [
            "addRoute",
            "configure",
            "startServer"
        ]);
    });
    it("starts a server", () => {
        var apiServer, config;

        config = {
            server: {
                "baseUrl": "https://localhost:8080/",
                "port": 8443
            }
        };
        apiServer = new ApiServer(config, webServerMock);
        expect(webServerMock.configure).toHaveBeenCalledWith({
            "baseUrl": "https://localhost:8080/",
            "port": 8443
        });
        expect(apiServer).toEqual(jasmine.any(Object));
        expect(webServerMock.startServer).toHaveBeenCalled();
    });
    it("sets up a route", () => {
        var addRouteCallback, next, req, res;

        res = jasmine.createSpyObj("resMock", [
            "send",
            "setHeader"
        ]);
        next = jasmine.createSpy("nextMock");
        new ApiServer({}, webServerMock);
        expect(webServerMock.addRoute).toHaveBeenCalledWith("get", "/", jasmine.any(Function));
        addRouteCallback = webServerMock.addRoute.mostRecentCall.args[2];
        expect(() => {
            addRouteCallback(req, res, next);
        }).not.toThrow();
        expect(res.setHeader).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });
});