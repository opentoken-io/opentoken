/* eslint consistent-this:"off" */

"use strict";

describe("WebServer", () => {
    var containerMock, ErrorResponse, fsAsyncMock, loggerMock, middlewareProfiler, promiseMock, restify, restifyRouterMagicMock, restifyServer, restMiddleware, webServer;

    beforeEach(() => {
        var formattersMock, randomMock, WebServer;

        /**
         * Set up a fake MiddlewareProfiler object
         */
        class MiddlewareProfilerMock {
            /**
             * Construct an object.  Spies on necessary functions.
             */
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
        formattersMock = require("../mock/formatters-mock")();
        loggerMock = require("../mock/logger-mock")();
        promiseMock = require("../mock/promise-mock")();
        ErrorResponse = require("../../lib/error-response")(promiseMock);
        randomMock = require("../mock/random-mock")();
        fsAsyncMock = jasmine.createSpyObj("fsAsyncMock", [
            "readFileAsync"
        ]);
        restifyServer = jasmine.createSpyObj("restifyServer", [
            "del",
            "get",
            "listen",
            "on",
            "use"
        ]);
        restifyServer.listen.and.callFake((port, callback) => {
            callback();
        });
        restify = jasmine.createSpyObj("restify", [
            "createServer"
        ]);
        restify.createServer.and.returnValue(restifyServer);
        restifyRouterMagicMock = jasmine.createSpy("restifyRouterMagicAsync").and.callFake(() => {
            return promiseMock.resolve();
        });
        restMiddleware = jasmine.createSpy("restMiddleware");
        containerMock = {};
        WebServer = require("../../lib/web-server")(containerMock, ErrorResponse, formattersMock, fsAsyncMock, loggerMock, MiddlewareProfilerMock, promiseMock, randomMock, restify, restifyRouterMagicMock, restMiddleware);
        webServer = new WebServer({
            exceptionIdLength: 8
        });
    });
    it("exposes known public methods", () => {
        expect(webServer.addMiddleware).toEqual(jasmine.any(Function));
        expect(webServer.addRoutes).toEqual(jasmine.any(Function));
        expect(webServer.configure).toEqual(jasmine.any(Function));
        expect(webServer.startServerAsync).toEqual(jasmine.any(Function));
    });
    describe(".addMiddleware()", () => {
        it("adds middleware without a route", () => {
            /**
             * Meaningless function used only for testing
             */
            function testFn() {}

            expect(restifyServer.use).not.toHaveBeenCalled();
            webServer.addMiddleware(testFn);

            return webServer.startServerAsync().then(() => {
                expect(restifyServer.use).toHaveBeenCalledWith(testFn);
            });
        });
        it("adds middleware with a route", () => {
            /**
             * Meaningless function used only for testing
             */
            function testFn() {}

            expect(restifyServer.use).not.toHaveBeenCalled();
            webServer.addMiddleware("/flowers", testFn);

            return webServer.startServerAsync().then(() => {
                expect(restifyServer.use).toHaveBeenCalledWith("/flowers", testFn);
            });
        });
        it("adds more than one middleware", () => {
            /**
             * Meaningless function used only for testing
             */
            function testFn1() {}

            /**
             * Meaningless function used only for testing
             */
            function testFn2() {}

            expect(restifyServer.use).not.toHaveBeenCalled();
            webServer.addMiddleware(testFn1);
            webServer.addMiddleware("/flowers", testFn2);

            return webServer.startServerAsync().then(() => {
                expect(restifyServer.use).toHaveBeenCalledWith(testFn1);
                expect(restifyServer.use).toHaveBeenCalledWith("/flowers", testFn2);
            });
        });
    });
    describe(".addRoutes()", () => {
        it("calls out to RestifyRouterMagic", () => {
            expect(restifyServer.get).not.toHaveBeenCalled();
            webServer.addRoutes("/routes");

            return webServer.startServerAsync().then(() => {
                expect(restifyRouterMagicMock).toHaveBeenCalled();
                expect(restifyRouterMagicMock.calls.mostRecent().args[1]).toEqual({
                    indexWithSlash: "never",
                    options: {
                        container: containerMock
                    },
                    routesMatch: "**/!(_)*.js",
                    routesPath: "/routes"
                });
            });
        });
    });
    describe(".configure()", () => {
        var defaultConfig;

        /**
         * Tests the configuration and confirms that it is set right.
         *
         * @param {Object} input What to pass in
         * @param {Object} expected How to override the defaults
         * @return {Promise.<*>}
         */
        function testConfig(input, expected) {
            var actual;

            // Set defaults in expected
            Object.keys(defaultConfig).forEach((key) => {
                if (typeof expected[key] === "undefined") {
                    expected[key] = defaultConfig[key];
                }
            });

            // Set the config
            webServer.configure(input);

            return webServer.startServerAsync().then(() => {
                // test the config passed to restifyServer
                expect(restify.createServer.calls.count()).toBe(1);
                expect(restify.createServer.calls.mostRecent().args.length).toBe(1);
                actual = restify.createServer.calls.mostRecent().args[0];
                expect(actual).toEqual(expected);
            });
        }

        beforeEach(() => {
            defaultConfig = {
                formatters: jasmine.any(Object),
                handleUncaughtExceptions: true,
                handleUpgrades: false,
                httpsServerOptions: null,
                name: "OpenToken API",
                proxyProtocol: false,
                spdy: null
            };
        });
        it("works with no configuration", () => {
            // This confirms all of the defaults work as expected
            return testConfig({}, {});
        });
        it("works when passing something that is not an object", () => {
            return testConfig(12, {});
        });
        it("does not trigger https without certificateFile", () => {
            return testConfig({
                keyFile: "test1"
            }, {});
        });
        it("does not trigger https without keyFile", () => {
            return testConfig({
                certificateFile: "test1"
            }, {});
        });
        it("reads certificate and key files", () => {
            fsAsyncMock.readFileAsync.and.callFake((fn) => {
                if (fn === "keyfile") {
                    return promiseMock.resolve("keyfile ok");
                }

                if (fn === "certfile") {
                    return promiseMock.resolve("certfile ok");
                }

                return promiseMock.reject(`Invalid file: ${fn.toString()}`);
            });

            return testConfig({
                certificateFile: "certfile",
                keyFile: "keyfile"
            }, {
                certificate: "certfile ok",
                key: "keyfile ok"
            });
        });
        it("passes name", () => {
            return testConfig({
                name: "flowers"
            }, {
                name: "flowers"
            });
        });
        it("passes proxyProtocol", () => {
            return testConfig({
                proxyProtocol: 123
            }, {
                proxyProtocol: 123
            });
        });
        it("passes spdy", () => {
            return testConfig({
                spdy: 123
            }, {
                spdy: 123
            });
        });
        it("does not trim a baseUrl without a trailing slash", () => {
            webServer.configure({
                baseUrl: "/bunnies"
            });

            return webServer.startServerAsync().then(() => {
                // Skipping most checks here because they were done
                // in the previous test.
                expect(restMiddleware.calls.mostRecent().args[0].baseUrl).toBe("/bunnies");
            });
        });
        it("passes profileMiddleware", () => {
            var args;

            webServer.configure({
                profileMiddleware: true
            });
            expect(middlewareProfiler).toBe(null);

            return webServer.startServerAsync().then(() => {
                expect(middlewareProfiler.profileServer).toHaveBeenCalled();
                expect(middlewareProfiler.displayAtInterval).toHaveBeenCalled();
                args = middlewareProfiler.profileServer.calls.mostRecent().args;
                expect(args.length).toBe(1);
                expect(args[0]).toBe(restifyServer);
                args = middlewareProfiler.displayAtInterval.calls.mostRecent().args;
                expect(args.length).toBe(2);
                expect(args[0]).toEqual(jasmine.any(Function));
                expect(args[1]).toEqual(jasmine.any(Number));
                expect(() => {
                    args[0]("test");
                }).not.toThrow();
            });
        });
    });
    describe(".startServerAsync()", () => {
        it("calls listen", () => {
            var args;

            expect(restifyServer.listen).not.toHaveBeenCalled();

            return webServer.startServerAsync().then(() => {
                expect(restifyServer.listen).toHaveBeenCalled();
                expect(restifyServer.listen.calls.count()).toBe(1);
                args = restifyServer.listen.calls.mostRecent().args;

                // default port
                expect(args[0]).toBe(8080);
                expect(args[1]).toEqual(jasmine.any(Function));
                expect(args.length).toBe(2);
            });
        });
        it("has a working callback", () => {
            return webServer.startServerAsync().then(() => {
                restifyServer.listen.calls.mostRecent().args[1]();
            });
        });
        it("executes the uncaughtException callback", () => {
            var args, callback, req, res, route, uncaughtCallback;

            req = require("../mock/request-mock")();
            res = require("../mock/response-mock")();

            return webServer.startServerAsync().then(() => {
                callback = restifyServer.listen.calls.mostRecent().args[1];
                expect(() => {
                    callback();
                }).not.toThrow();
                expect(restifyServer.on).toHaveBeenCalled();
                args = restifyServer.on.calls.argsFor(0);
                expect(args.length).toBe(2);
                expect(args[0]).toBe("uncaughtException");
                expect(args[1]).toEqual(jasmine.any(Function));
                uncaughtCallback = args[1];

                return uncaughtCallback(req, res, route, {
                    error: true
                });
            }).then(() => {
                expect(req.log).toHaveBeenCalled();
                expect(res.send).toHaveBeenCalledWith(500, jasmine.any(ErrorResponse));
                expect(res.write).not.toHaveBeenCalled();
            });
        });
        it("executes the restifyError callback", () => {
            var args, callback, req, res, uncaughtCallback;

            req = require("../mock/request-mock")();
            res = require("../mock/response-mock")();

            return webServer.startServerAsync().then(() => {
                var error;

                callback = restifyServer.listen.calls.mostRecent().args[1];
                expect(() => {
                    callback();
                });
                expect(restifyServer.on).toHaveBeenCalled();
                args = restifyServer.on.calls.argsFor(1);
                expect(args.length).toBe(2);
                expect(args[0]).toBe("restifyError");
                expect(args[1]).toEqual(jasmine.any(Function));
                uncaughtCallback = args[1];
                error = new Error("err");

                return promiseMock.promisify(uncaughtCallback)(req, res, error);
            }).then(() => {
                expect(req.log).toHaveBeenCalled();
                expect(res.send).not.toHaveBeenCalled();
                expect(res.write).not.toHaveBeenCalled();
            });
        });
    });
});
