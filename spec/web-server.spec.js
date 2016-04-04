describe("web-server", function () {
    "use strict";

    var fs, logger, restify, restMiddleware, WebServer;

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

        };

        restMiddleware = function () {

        };

        spyOn(fs, "readFileSync");
        spyOn(logger, "console");
        spyOn(logger, "debug");
        spyOn(logger, "error");
        spyOn(logger, "info");
        spyOn(logger, "warn");
    });

    describe("constructor", function () {
        it("sets up properties without config options then calls configure", function () {
            var webServer = new WebServer(fs, logger, restify, restMiddleware);

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
    });
});