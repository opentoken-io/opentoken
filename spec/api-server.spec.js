"use strict";

describe("ApiServer", () => {
    var apiServer, webServerMock;

    beforeEach(() => {
        var ApiServer, configMock;

        ApiServer = require("../lib/api-server");
        configMock = {
            server: {
                "baseUrl": "https://localhost:8080/",
                "port": 8443
            }
        };
        webServerMock = jasmine.createSpyObj("webServerMock", [
            "configure",
            "addRoute",
            "startServer"
        ]);
        apiServer = new ApiServer(configMock, webServerMock);
    });

    it("starts a server", () => {
        var next, req, res, routeCall;
        res = jasmine.createSpyObj("resMock", [
            "setHeader",
            "send"
        ]);
        next = jasmine.createSpy("nextMock");
        expect(webServerMock.configure).toHaveBeenCalledWith({
            "baseUrl": "https://localhost:8080/",
            "port": 8443
        });
        expect(apiServer).toEqual(jasmine.any(Object));
        expect(webServerMock.addRoute).toHaveBeenCalledWith("get", "/", jasmine.any(Function));
        routeCall = webServerMock.addRoute.mostRecentCall.args[2];
        routeCall(req, res, next);
        expect(webServerMock.startServer).toHaveBeenCalled();
    });
});