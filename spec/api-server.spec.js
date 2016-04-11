"use strict";

describe("ApiServer", () => {
    var apiServer, ApiServer, config, webServerMock;

    beforeEach(() => {
        ApiServer = require("../lib/api-server");
        webServerMock = jasmine.createSpyObj("webServerMock", [
            "configure",
            "addRoute",
            "startServer"
        ]);
    });
    it("starts a server", () => {
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
        var next, req, res, routeCall;
        res = jasmine.createSpyObj("resMock", [
            "setHeader",
            "send"
        ]);
        next = jasmine.createSpy("nextMock");

        apiServer = new ApiServer({}, webServerMock);

        expect(webServerMock.addRoute).toHaveBeenCalledWith("get", "/", jasmine.any(Function));
        routeCall = webServerMock.addRoute.mostRecentCall.args[2];
        expect(() => {
            routeCall(req, res, next);
        }).not.toThrow();
    });
});