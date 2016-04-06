describe("web-server", function () {
    "use strict";

    var logger, restMiddleware, webServer;

    beforeEach(function () {
        var fs, LoggerMock, restify, WebServer;

        LoggerMock = require("./mock/logger-mock");
        WebServer = require("../lib/web-server");

        fs = jasmine.createSpyObj("fs", [
            "readFileSync"
        ]);

        restify = jasmine.createSpyObj("restify", [
            "createServer"
        ]);
        restify.createServer.andReturn({});

        restMiddleware = jasmine.createSpy("restMiddleware");

        logger = new LoggerMock();
        webServer = new WebServer(fs, logger, restify, restMiddleware);
    });

    describe("constructor and configure", function () {
        it("should set up for HTTPS", function () {
            webServer.configure({
                certificateFile: "./cert.crt",
                keyFile: "./key.key",
            });

            expect(webServer.config.https).toBe(true);
        });

        it("should not have HTTPS from missing cert file", function () {
            webServer.configure({
                certificateFile: null,
                keyFile: "./key.key",
            });

            expect(webServer.config.https).toBe(false);
        });

        it("should take out extra slash in host name", function () {
            webServer.configure({
                baseUrl: "https://localhost:8443/"
            });

            expect(webServer.config.baseUrl).toEqual("https://localhost:8443");
        });

        it("should take out extra slash in host name with just a slash", function () {
            webServer.configure({
                baseUrl: "/"
            });

            expect(webServer.config.baseUrl).toEqual("");
        });
    });


    describe("addMiddleware", function () {
        beforeEach(function () {
            webServer.app = jasmine.createSpy("webServer.app");

            webServer.app.andReturn({
                use: jasmine.createSpy("use")
            });
        });

        it("should add middleware with a path and callback", function () {
            webServer.addMiddleware("/path", function () {
                // Magical code
                return true;
            });

            expect(logger.debug).toHaveBeenCalled();
            expect(webServer.app().use).toHaveBeenCalledWith("/path", jasmine.any(Function));
        });

        it("should add middleware with just a path", function () {
            webServer.addMiddleware("/path2");

            expect(logger.debug).toHaveBeenCalled();
            expect(webServer.app().use).toHaveBeenCalledWith("/path2");
        });
    });

    describe("addRoute", function () {
        beforeEach(function () {
            webServer.app = jasmine.createSpy("webServer.app");

            webServer.app.andReturn({
                get: jasmine.createSpy("get")
            });
        });

        it("should add a route", function () {
            webServer.addRoute("get", "/", (req, res, next) => {
                // does something magical
            });

            expect(logger.debug).toHaveBeenCalled();
        });
    });

    describe("app", function () {
        beforeEach(function () {
            webServer.profileMiddleware = jasmine.createSpy("webServer.profileMiddleware");
        });

        it("should set up the server", function () {
            webServer.config = {
                name: "OpenToken API"
            };

            webServer.app();

            expect(logger.debug).toHaveBeenCalled();
            expect(webServer.restMiddleware).toHaveBeenCalled();
        });

        it("should set up the server to profile", function () {
            webServer.config = {
                name: "OpenToken API",
                profileMiddleware: true
            };

            webServer.app();

            expect(logger.debug).toHaveBeenCalled();
            expect(webServer.profileMiddleware).toHaveBeenCalledWith({}, setInterval);
            expect(webServer.restMiddleware).toHaveBeenCalledWith({
                name: "OpenToken API",
                profileMiddleware: true
            }, {});
        });
    });

    describe("startServer", function () {
        beforeEach(function () {
            webServer.attachErrorHandlers = jasmine.createSpy("webServer.attachErrorHandlers");
            webServer.app = jasmine.createSpy("webServer.app");

            webServer.app.andReturn({
                listen: jasmine.createSpy("listen")
            });
        });

        it("should attach error handlers and lister to port set", function () {
            webServer.config = {
                port: 8443
            };

            webServer.startServer();

            expect(logger.debug).toHaveBeenCalled();
            expect(webServer.attachErrorHandlers).toHaveBeenCalled();
            expect(webServer.app().listen).toHaveBeenCalledWith(8443, jasmine.any(Function));
        });
    });

    describe("profileMiddleware", function () {
        var server, useSpy;

        beforeEach(function () {
            useSpy = jasmine.createSpy("server.use");

            server = {
                use: useSpy
            };
        });

        it("should monkey patch server.use and call at interval", function () {
            var intervalFn = jasmine.createSpy("intervalFn");

            webServer.profileMiddleware(server, intervalFn);

            expect(server.use).not.toEqual(useSpy);
            expect(server.use).toEqual(jasmine.any(Function));
            expect(intervalFn).toHaveBeenCalled();
        });
    });
});