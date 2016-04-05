describe("web-server", function () {
    "use strict";

    var fs, logger, restify, restMiddleware, webServer, WebServer;

    WebServer = require("../lib/web-server");

    beforeEach(function () {
        fs = {
            readFileSync: function () {}
        };

        logger = {
            console: function () {},
            debug: function () {},
            error: function () {},
            info: function () {},
            warn: function () {}
        };

        restify = {
            createServer: function () {
                return {};
            }
        };

        restMiddleware = function () {

        };

        spyOn(fs, "readFileSync");
        spyOn(logger, "console");
        spyOn(logger, "debug");
        spyOn(logger, "error");
        spyOn(logger, "info");
        spyOn(logger, "warn");
        spyOn(restify, "createServer").andReturn({});
    });

    beforeEach(function () {
        webServer = new WebServer(fs, logger, restify, restMiddleware);
    });

    describe("constructor and configure", function () {
        it("sets up properties without config options then calls configure", function () {
            expect(webServer.config).toEqual({
                baseUrl: "",
                certificateFile: null,
                keyFile: null,
                https: false,
                name: "OpenToken API",
                port: 8080,
                profileMiddleware: false,
                proxyProtocol: false,
                spdy: null,
                version: null
            });

            webServer.configure({
                baseUrl: "https://localhost:8443",
                certificateFile: "./cert.crt",
                keyFile: "./key.key",
                name: "OpenToken API Test",
                port: 8443,
                profileMiddleware: true,
                proxyProtocol: true,
                spdy: true,
                version: "2"
            });

            expect(webServer.config).toEqual({
                baseUrl: "https://localhost:8443",
                certificateFile: "./cert.crt",
                keyFile: "./key.key",
                https: true,
                name: "OpenToken API Test",
                port: 8443,
                profileMiddleware: true,
                proxyProtocol: true,
                spdy: true,
                version: "2"
            });

            expect(webServer.restifyConfig).toEqual({
                handleUncaughtExceptions: true,
                handleUpgrades: false,
                httpsServerOptions: null,
                name: "OpenToken API Test",
                proxyProtocol: true,
                spdy: true,
                version: "2"
            });

            expect(fs.readFileSync).toHaveBeenCalledWith("./cert.crt");
            expect(fs.readFileSync).toHaveBeenCalledWith("./key.key");
        });

        it("sets up properties while missing cert file config", function () {
            webServer.configure({
                baseUrl: "https://localhost:8443",
                certificateFile: null,
                keyFile: "./key.key",
            });

            expect(webServer.config).toEqual({
                baseUrl: "https://localhost:8443",
                certificateFile: null,
                keyFile: null,
                https: false,
                name: "OpenToken API",
                port: 8080,
                profileMiddleware: false,
                proxyProtocol: false,
                spdy: null,
                version: null
            });

            expect(fs.readFileSync).not.toHaveBeenCalled();
            expect(fs.readFileSync).not.toHaveBeenCalled();
        });

        it("sets up properties while missing cert file config", function () {
            webServer.configure({
                baseUrl: "https://localhost:8443/",
                certificateFile: null,
                keyFile: "./key.key",
            });

            expect(webServer.config.baseUrl).toEqual("https://localhost:8443");
        });
    });


    describe("addMiddleware", function () {
        beforeEach(function () {
            webServer.server = {
                use: function (a, b) {
                }
            };

            spyOn(webServer.server, "use");
        });

        it("adds middleware with path and callback", function () {
            webServer.addMiddleware("/path", function () {
                // Magical code
                return true;
            });

            expect(logger.debug).toHaveBeenCalledWith("Adding middleware for route: /path");
            expect(webServer.app().use).toHaveBeenCalledWith("/path", jasmine.any(Function));
        });

        it("adds middleware with path", function () {
            webServer.addMiddleware("/path2");

            expect(logger.debug).toHaveBeenCalledWith("Adding middleware");
            expect(webServer.app().use).toHaveBeenCalledWith("/path2");
        });
    });

    describe("addRoute", function () {
        beforeEach(function () {
            spyOn(webServer, "app").andReturn({"get": function () {

            }});
        });

        it("adds a route", function () {
            webServer.addRoute("get", "/", (req, res, next) => {
                // does something magical
            });

            expect(logger.debug).toHaveBeenCalledWith("Adding route: get /");
        });
    });

    describe("app", function () {
        beforeEach(function () {
            spyOn(webServer, "profileMiddleware");
            spyOn(webServer, "restMiddleware");
        });

        it("sets up the server", function () {
            webServer.config = {
                name: "OpenToken API"
            };

            webServer.app();

            expect(logger.debug).toHaveBeenCalledWith("Creating server with config: {\"name\":\"OpenToken API\"}");
            expect(webServer.restMiddleware).toHaveBeenCalled();
        });

        it("sets up the server to profile", function () {
            webServer.config = {
                name: "OpenToken API",
                profileMiddleware: true
            };

            webServer.app();

            expect(logger.debug).toHaveBeenCalledWith("Creating server with config: {\"name\":\"OpenToken API\",\"profileMiddleware\":true}");
            expect(webServer.profileMiddleware).toHaveBeenCalledWith({});
            expect(webServer.restMiddleware).toHaveBeenCalledWith({
                name: "OpenToken API",
                profileMiddleware: true
            }, {});
        });
    });

    describe("startServer", function () {
        beforeEach(function () {
            webServer.server = {
                listen: function (port, callback) {
                    logger.info();
                }
            };

            spyOn(webServer.server, "listen");
            spyOn(webServer, "attachErrorHandlers");
        });

        it("starts the server", function () {
            webServer.config = {
                port: 8443
            };

            webServer.startServer();

            expect(logger.debug).toHaveBeenCalled();
            expect(webServer.attachErrorHandlers).toHaveBeenCalled();
            expect(webServer.app().listen).toHaveBeenCalledWith(8443, jasmine.any(Function));
        });

    });
});