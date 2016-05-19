"use strict";

describe("WebServer", () => {
    var fs, loggerMock, middlewareProfiler, promiseMock, restify, restifyRouterMagicMock, restifyServer, restMiddleware, webServer;

    beforeEach(() => {
        var WebServer;

        // Set up a fake MiddlewareProfiler object
        class MiddlewareProfilerMock {
            constructor() {
                middlewareProfiler = this;
                [
                    "displayAtInterval",
                    "profileServer"
                ].forEach((methodName) => {
                    this[methodName] = jasmine.createSpy(methodName);
                });
            }
        }

        middlewareProfiler = null;
        promiseMock = require("../mock/promise-mock");
        loggerMock = require("../mock/logger-mock");
        fs = jasmine.createSpyObj("fs", [
            "readFileAsync"
        ]);
        restifyServer = jasmine.createSpyObj("restifyServer", [
            "del",
            "get",
            "listen",
            "on",
            "use"
        ]);
        restifyServer.listen.andCallFake((port, callback) => {
            callback();
        });
        restify = jasmine.createSpyObj("restify", [
            "createServer"
        ]);
        restify.createServer.andReturn(restifyServer);
        restifyRouterMagicMock = jasmine.createSpy("restifyRouterMagic").andCallFake((server, config, callback) => {
            callback(null);
        });
        restMiddleware = jasmine.createSpy("restMiddleware");
        WebServer = require("../../lib/web-server")(fs, loggerMock, MiddlewareProfilerMock, promiseMock, restify, restifyRouterMagicMock, restMiddleware);
        webServer = new WebServer();
    });
    it("exposes known public methods", () => {
        expect(webServer.addMiddleware).toEqual(jasmine.any(Function));
        expect(webServer.addRoutes).toEqual(jasmine.any(Function));
        expect(webServer.configure).toEqual(jasmine.any(Function));
        expect(webServer.startServerAsync).toEqual(jasmine.any(Function));
    });
    describe(".addMiddleware()", () => {
        it("adds middleware without a route", (done) => {
            function testFn() {}

            expect(restifyServer.use).not.toHaveBeenCalled();
            webServer.addMiddleware(testFn);
            webServer.startServerAsync().then(() => {
                expect(restifyServer.use).toHaveBeenCalledWith(testFn);
            }).then(done, done);
        });
        it("adds middleware with a route", (done) => {
            function testFn() {}

            expect(restifyServer.use).not.toHaveBeenCalled();
            webServer.addMiddleware("/flowers", testFn);
            webServer.startServerAsync().then(() => {
                expect(restifyServer.use).toHaveBeenCalledWith("/flowers", testFn);
            }).then(done, done);
        });
        it("adds more than one middleware", (done) => {
            function testFn1() {}

            function testFn2() {}

            expect(restifyServer.use).not.toHaveBeenCalled();
            webServer.addMiddleware(testFn1);
            webServer.addMiddleware("/flowers", testFn2);
            webServer.startServerAsync().then(() => {
                expect(restifyServer.use).toHaveBeenCalledWith(testFn1);
                expect(restifyServer.use).toHaveBeenCalledWith("/flowers", testFn2);
            }).then(done, done);
        });
    });
    describe(".addRoutes()", () => {
        it("calls out to RestifyRouterMagic", (done) => {
            expect(restifyServer.get).not.toHaveBeenCalled();
            webServer.addRoutes("/routes");
            webServer.startServerAsync().then(() => {
                expect(restifyRouterMagicMock).toHaveBeenCalled();
                expect(restifyRouterMagicMock.mostRecentCall.args[1]).toEqual({
                    routesPath: "/routes"
                });
            }).then(done, done);
        });
    });
    describe(".configure()", () => {
        var defaultConfig;

        function testConfig(input, expected, done) {
            var actual;

            // Set defaults in expected
            Object.keys(defaultConfig).forEach((key) => {
                if (expected[key] === undefined) {
                    expected[key] = defaultConfig[key];
                }
            });

            // Set the config
            webServer.configure(input);
            webServer.startServerAsync().then(() => {
                // test the config passed to restifyServer
                expect(restify.createServer.callCount).toBe(1);
                expect(restify.createServer.mostRecentCall.args.length).toBe(1);
                actual = restify.createServer.mostRecentCall.args[0];
                expect(actual).toEqual(expected);
            }).then(done, done);
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
        it("works with no configuration", (done) => {
            // This confirms all of the defaults work as expected
            testConfig({}, {}, done);
        });
        it("does not trigger https without certificateFile", (done) => {
            testConfig({
                keyFile: "test1"
            }, {}, done);
        });
        it("does not trigger https without keyFile", (done) => {
            testConfig({
                certificateFile: "test1"
            }, {}, done);
        });
        it("reads certificate and key files", (done) => {
            fs.readFileAsync.andCallFake((fn) => {
                if (fn == "keyfile") {
                    return promiseMock.resolve("keyfile ok");
                }

                if (fn == "certfile") {
                    return promiseMock.resolve("certfile ok");
                }

                return promiseMock.reject("Invalid file: " + fn.toString());
            });
            testConfig({
                certificateFile: "certfile",
                keyFile: "keyfile"
            }, {
                certificate: "certfile ok",
                key: "keyfile ok"
            }, done);
        });
        it("passes name", (done) => {
            testConfig({
                name: "flowers"
            }, {
                name: "flowers"
            }, done);
        });
        it("passes proxyProtocol", (done) => {
            testConfig({
                proxyProtocol: 123
            }, {
                proxyProtocol: 123
            }, done);
        });
        it("passes spdy", (done) => {
            testConfig({
                spdy: 123
            }, {
                spdy: 123
            }, done);
        });
        it("passes version", (done) => {
            testConfig({
                version: "flowers"
            }, {
                version: "flowers"
            }, done);
        });
        it("forces the baseUrl to not have a trailing slash", (done) => {
            var args;

            webServer.configure({
                baseUrl: "/bunnies/"
            });
            webServer.startServerAsync().then(() => {
                expect(restMiddleware).toHaveBeenCalled();
                expect(restMiddleware.callCount).toBe(1);
                args = restMiddleware.mostRecentCall.args;
                expect(args.length).toBe(2);
                expect(args[1]).toBe(restifyServer);
                expect(args[0]).toEqual(jasmine.any(Object));
                expect(args[0].baseUrl).toBe("/bunnies");
            }).then(done, done);
        });
        it("does not trim a baseUrl without a trailing slash", (done) => {
            webServer.configure({
                baseUrl: "/bunnies"
            });
            webServer.startServerAsync().then(() => {
                // Skipping most checks here because they were done
                // in the previous test.
                expect(restMiddleware.mostRecentCall.args[0].baseUrl).toBe("/bunnies");
            }).then(done, done);
        });
        it("passes profileMiddleware", (done) => {
            var args;

            webServer.configure({
                profileMiddleware: true
            });
            expect(middlewareProfiler).toBe(null);
            webServer.startServerAsync().then(() => {
                expect(middlewareProfiler.profileServer).toHaveBeenCalled();
                expect(middlewareProfiler.displayAtInterval).toHaveBeenCalled();
                args = middlewareProfiler.profileServer.mostRecentCall.args;
                expect(args.length).toBe(1);
                expect(args[0]).toBe(restifyServer);
                args = middlewareProfiler.displayAtInterval.mostRecentCall.args;
                expect(args.length).toBe(2);
                expect(args[0]).toEqual(jasmine.any(Number));
                expect(args[1]).toEqual(jasmine.any(Function));
                expect(() => {
                    args[1]("test");
                }).not.toThrow();
            }).then(done, done);
        });
    });
    describe(".startServerAsync()", () => {
        it("calls listen", (done) => {
            var args;

            expect(restifyServer.listen).not.toHaveBeenCalled();
            webServer.startServerAsync().then(() => {
                expect(restifyServer.listen).toHaveBeenCalled();
                expect(restifyServer.listen.callCount).toBe(1);
                args = restifyServer.listen.mostRecentCall.args;
                expect(args[0]).toBe(8080);  // default port
                expect(args[1]).toEqual(jasmine.any(Function));
                expect(args.length).toBe(2);
            }).then(done, done);
        });
        it("has a working callback", (done) => {
            var callback;

            webServer.startServerAsync().then(() => {
                callback = restifyServer.listen.mostRecentCall.args[1];
                expect(function() {
                    callback();
                }).not.toThrow();
            }).then(done, done);
        });
        it("executes the uncaughtException callback", (done) => {
            var callback, args, uncaughtCallback, req, res, route;

            req = jasmine.createSpy("req");
            res = jasmine.createSpyObj("res", [
                "send",
                "write"
            ]);
            webServer.startServerAsync().then(() => {
                callback = restifyServer.listen.mostRecentCall.args[1];
                expect(function () {
                    callback();
                });
                expect(restifyServer.on).toHaveBeenCalled();
                args = restifyServer.on.mostRecentCall.args;
                expect(args.length).toBe(2);
                expect(args[0]).toBe("uncaughtException");
                expect(args[1]).toEqual(jasmine.any(Function));
                uncaughtCallback = args[1];
                uncaughtCallback(req, res, route, {"error": true});
                expect(loggerMock.error).toHaveBeenCalled();
                expect(res.send).toHaveBeenCalledWith(500);
                expect(res.write).not.toHaveBeenCalled();
            }).then(done, done);
        });
    });
});
