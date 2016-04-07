"use strict";

describe("WebServer", () => {
    var fs, logger, middlewareProfiler, restify, restifyServer, restMiddleware, webServer;

    beforeEach(() => {
        var LoggerMock, promiseMock, WebServer;

        promiseMock = require("./mock/promise-mock")();
        LoggerMock = require("./mock/logger-mock");
        WebServer = require("../lib/web-server");
        fs = jasmine.createSpyObj("fs", [
            "readFileSync"
        ]);
        restifyServer = jasmine.createSpyObj("restifyServer", [
            "del",
            "get",
            "listen",
            "on",
            "use"
        ]);
        restify = jasmine.createSpyObj("restify", [
            "createServer"
        ]);
        restify.createServer.andReturn(restifyServer);
        restMiddleware = jasmine.createSpy("restMiddleware");
        middlewareProfiler = jasmine.createSpyObj("middlewareProfiler", [
            "displayAtInterval",
            "profileServer"
        ]);
        logger = new LoggerMock();
        webServer = new WebServer(fs, logger, middlewareProfiler, promiseMock, restify, restMiddleware);
    });
    it("exposes known public methods", () => {
        expect(webServer.addMiddleware).toEqual(jasmine.any(Function));
        expect(webServer.addRoute).toEqual(jasmine.any(Function));
        expect(webServer.configure).toEqual(jasmine.any(Function));
        expect(webServer.startServer).toEqual(jasmine.any(Function));
    });
    describe(".addMiddleware()", () => {
        it("adds middleware without a route", () => {
            function testFn() {}

            expect(restifyServer.use).not.toHaveBeenCalled();
            webServer.addMiddleware(testFn);
            expect(restifyServer.use).toHaveBeenCalledWith(testFn);
        });
        it("adds middleware with a route", () => {
            function testFn() {}

            expect(restifyServer.use).not.toHaveBeenCalled();
            webServer.addMiddleware("/flowers", testFn);
            expect(restifyServer.use).toHaveBeenCalledWith("/flowers", testFn);
        });
        it("adds more than one middleware", () => {
            function testFn1() {}

            function testFn2() {}

            expect(restifyServer.use).not.toHaveBeenCalled();
            webServer.addMiddleware(testFn1);
            expect(restifyServer.use).toHaveBeenCalledWith(testFn1);
            expect(restifyServer.use).not.toHaveBeenCalledWith("/flowers", testFn2);
            webServer.addMiddleware("/flowers", testFn2);
            expect(restifyServer.use).toHaveBeenCalledWith("/flowers", testFn2);
        });
    });
    describe(".addRoute()", () => {
        it("assigns middleware to a route and a verb", () => {
            function testFn() {}

            expect(restifyServer.get).not.toHaveBeenCalled();
            webServer.addRoute("get", "/", testFn);
            expect(restifyServer.get).toHaveBeenCalledWith("/", testFn);
        });
        it("lowercases methods and converts 'delete'", () => {
            function testFn() {}

            expect(restifyServer.get).not.toHaveBeenCalled();
            webServer.addRoute("DELETE", "/", testFn);
            expect(restifyServer.del).toHaveBeenCalledWith("/", testFn);
        });
    });
    describe(".configure()", () => {
        var defaultConfig;

        function testConfig(input, expected) {
            var actual;

            // Set defaults in expected
            Object.keys(defaultConfig).forEach((key) => {
                if (expected[key] === undefined) {
                    expected[key] = defaultConfig[key];
                }
            });

            // Set the config
            webServer.configure(input);

            // Trigger the internal call to this.app() because that
            // sends the configuration to restify.createServer().
            webServer.addMiddleware(() => {});

            // test the config passed to restifyServer
            expect(restify.createServer.callCount).toBe(1);
            expect(restify.createServer.mostRecentCall.args.length).toBe(1);
            actual = restify.createServer.mostRecentCall.args[0];
            expect(actual).toEqual(expected);
        }

        beforeEach(() => {
            defaultConfig = {
                handleUncaughtExceptions: true,
                handleUpgrades: false,
                httpsServerOptions: null,
                name: "OpenToken API",
                proxyProtocol: false,
                spdy: null,
                version: null
            };
        });
        it("works with no configuration", () => {
            // This confirms all of the defaults work as expected
            testConfig({}, {});
        });
        it("does not trigger https without certificateFile", () => {
            testConfig({
                keyFile: "test1"
            }, {});
        });
        it("does not trigger https without keyFile", () => {
            testConfig({
                certificateFile: "test1"
            }, {});
        });
        it("reads certificate and key files", () => {
            fs.readFileSync.andCallFake((fn) => {
                if (fn == "keyfile") {
                    return "keyfile ok";
                }

                if (fn == "certfile") {
                    return "certfile ok";
                }

                throw new Error("Invalid file: " + fn.toString());
            });
            testConfig({
                certificateFile: "certfile",
                keyFile: "keyfile"
            }, {
                certificate: "certfile ok",
                key: "keyfile ok"
            });
        });
        it("passes name", () => {
            testConfig({
                name: "flowers"
            }, {
                name: "flowers"
            });
        });
        it("passes proxyProtocol", () => {
            testConfig({
                proxyProtocol: 123
            }, {
                proxyProtocol: 123
            });
        });
        it("passes spdy", () => {
            testConfig({
                spdy: 123
            }, {
                spdy: 123
            });
        });
        it("passes version", () => {
            testConfig({
                version: "flowers"
            }, {
                version: "flowers"
            });
        });
        it("forces the baseUrl to not have a trailing slash", () => {
            var args;

            webServer.configure({
                baseUrl: "/bunnies/"
            });

            // Trigger the internal call to this.app() because that
            // sends the configuration to restify.createServer().
            webServer.addMiddleware(() => {});

            expect(restMiddleware).toHaveBeenCalled();
            expect(restMiddleware.callCount).toBe(1);
            args = restMiddleware.mostRecentCall.args;
            expect(args.length).toBe(2);
            expect(args[1]).toBe(restifyServer);
            expect(args[0]).toEqual(jasmine.any(Object));
            expect(args[0].baseUrl).toBe("/bunnies");
        });
        it("does not trim a baseUrl without a trailing slash", () => {
            webServer.configure({
                baseUrl: "/bunnies"
            });

            // Trigger the internal call to this.app() because that
            // sends the configuration to restify.createServer().
            webServer.addMiddleware(() => {});

            // Skipping most checks here because they were done
            // in the previous test.

            expect(restMiddleware.mostRecentCall.args[0].baseUrl).toBe("/bunnies");
        });
        it("passes profileMiddleware", () => {
            var args;

            webServer.profileMiddleware = jasmine.createSpy("webServer.profileMiddleware");
            webServer.configure({
                profileMiddleware: true
            });

            expect(middlewareProfiler.profileServer).not.toHaveBeenCalled();
            expect(middlewareProfiler.displayAtInterval).not.toHaveBeenCalled();

            // Trigger the internal call to this.app() because that
            // sends the configuration to restify.createServer().
            webServer.addMiddleware(() => {});

            expect(middlewareProfiler.profileServer).toHaveBeenCalled();
            expect(middlewareProfiler.displayAtInterval).toHaveBeenCalled();
            args = middlewareProfiler.profileServer.mostRecentCall.args;
            expect(args.length).toBe(1);
            expect(args[0]).toBe(restifyServer);
            args = middlewareProfiler.displayAtInterval.mostRecentCall.args;
            expect(args.length).toBe(2);
            expect(args[0]).toEqual(jasmine.any(Number));
            expect(args[1]).toEqual(jasmine.any(Function));
            expect(function () {
                args[1]("test");
            }).not.toThrow();
        });
    });
    describe(".startServer()", () => {
        it("calls listen", () => {
            var args;

            expect(restifyServer.listen).not.toHaveBeenCalled();
            webServer.startServer();
            expect(restifyServer.listen).toHaveBeenCalled();
            expect(restifyServer.listen.callCount).toBe(1);
            args = restifyServer.listen.mostRecentCall.args;
            expect(args[0]).toBe(8080);  // default port
            expect(args[1]).toEqual(jasmine.any(Function));
            expect(args.length).toBe(2);
        });
        it("has a working callback", () => {
            var callback;

            webServer.startServer();
            callback = restifyServer.listen.mostRecentCall.args[1];
            expect(function() {
                callback();
            }).not.toThrow();
        });

        it("has a working callback", () => {
            var callback, args, uncaughtCallback, req, res, route;

            req = jasmine.createSpy("req");
            res = jasmine.createSpyObj("res", [
                "send",
                "write"
            ]);

            webServer.startServer();
            callback = restifyServer.listen.mostRecentCall.args[1];
            expect(function() {
                callback();
            });

            expect(restifyServer.on).toHaveBeenCalled();
            args = restifyServer.on.mostRecentCall.args;
            expect(args.length).toBe(2);
            expect(args[0]).toBe("uncaughtException");
            expect(args[1]).toEqual(jasmine.any(Function));
            uncaughtCallback = args[1];
            uncaughtCallback(req, res, route, {"error": true});
            expect(logger.error).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith(500);
            expect(res.write).not.toHaveBeenCalled();
        });
    });
});
