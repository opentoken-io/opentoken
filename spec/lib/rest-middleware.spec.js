"use strict";

describe("restMiddleware", () => {
    var helmetMock, restifyCookiesMock, restifyLinks, restifyMock, restifyPlugins, restMiddleware, serverMock;

    /**
     * Tests the common middleware set up when calling restMiddleware.
     * StandardLinks is tested on it's own due to the nature of what
     * needs to be tested there.
     */
    function expectNormalMiddlewareWasCalled() {
        [
            helmetMock.frameguard,
            helmetMock.ieNoOpen,
            helmetMock.hidePoweredBy,
            helmetMock.noCache,
            helmetMock.noSniff,
            helmetMock.xssFilter,
            restifyLinks,
            restifyMock.CORS,
            restifyPlugins.acceptParser,
            restifyPlugins.gzipResponse,
            restifyPlugins.queryParser
        ].forEach((spy) => {
            expect(spy).toHaveBeenCalled();
            expect(serverMock.use).toHaveBeenCalledWith(spy);
        });
    }

    /**
     * This generates fake middleware that are spies.
     *
     * @param {string} name
     * @param {Array.<string>} methods
     * @return {Object} middleware
     */
    function mockMiddleware(name, methods) {
        var middleware;

        middleware = jasmine.createSpyObj(name, methods);
        methods.forEach((methodName) => {
            middleware[methodName].andReturn(middleware[methodName]);
        });

        return middleware;
    }

    beforeEach(() => {
        var loggerMock, restMiddlewareFactory;

        restMiddlewareFactory = require("../../lib/rest-middleware");
        loggerMock = require("../mock/logger-mock")();
        helmetMock = mockMiddleware("helmetMock", [
            "frameguard",
            "hidePoweredBy",
            "hsts",
            "ieNoOpen",
            "noCache",
            "noSniff",
            "xssFilter"
        ]);
        serverMock = require("../mock/server-mock")();
        restifyMock = mockMiddleware("restifyMock", [
            "CORS"
        ]);
        restifyLinks = jasmine.createSpy("restifyLinks");
        restifyLinks.andReturn(restifyLinks);
        restifyPlugins = mockMiddleware("restifyPlugins", [
            "acceptParser",
            "gzipResponse",
            "queryParser"
        ]);
        restifyCookiesMock = jasmine.createSpyObj("restifyCookies", [
            "parse"
        ]);
        restMiddleware = restMiddlewareFactory(helmetMock, loggerMock, restifyMock, restifyCookiesMock, restifyLinks, restifyPlugins);
    });
    it("calls restMiddleware without https", () => {
        restMiddleware({
            https: false
        }, serverMock);
        expectNormalMiddlewareWasCalled();
        expect(helmetMock.hsts).not.toHaveBeenCalled();
    });
    it("calls restMiddleware with https", () => {
        restMiddleware({
            https: true
        }, serverMock);
        expectNormalMiddlewareWasCalled();
        expect(helmetMock.hsts).toHaveBeenCalled();
    });
    describe("self-discovery link creation", () => {
        var linkFunction, next, req, res;

        beforeEach(() => {
            next = jasmine.createSpy("nextMock");
            res = require("../mock/response-mock")();
            req = require("../mock/request-mock")();
            restMiddleware({
                baseUrl: "http://localhost:8443",
                https: false
            }, serverMock);
            linkFunction = serverMock.use.mostRecentCall.args[0];
        });
        it("adds appropriate links for GET", () => {
            linkFunction(req, res, next);
            expect(res.linkObjects).toEqual([
                {
                    href: "rendered route: self-discovery",
                    rel: "up",
                    title: "self-discovery"
                },
                {
                    href: "http://localhost:8443/path",
                    rel: "self"
                }
            ]);
        });
        it("adds appropriate links for POST", () => {
            req.method = "POST";
            linkFunction(req, res, next);
            expect(res.linkObjects).toEqual([
                {
                    href: "rendered route: self-discovery",
                    rel: "up",
                    title: "self-discovery"
                }
            ]);
        });
    });
});
