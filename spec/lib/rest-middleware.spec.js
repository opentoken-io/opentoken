"use strict";

describe("restMiddleware", () => {
    var helmetMock, linksMiddlewareMock, restifyCookiesMock, restifyLinks, restifyMock, restifyPlugins, restMiddleware, serverMock;

    /**
     * Tests the common middleware set up when calling restMiddleware.
     * Most of these middleware will just return themselves for ease of
     * testing.
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

        // This one middleware works correctly.  Its factory does not
        // return the factory.  It returns the middleware properly.
        expect(linksMiddlewareMock).toHaveBeenCalled();
        expect(serverMock.use).toHaveBeenCalledWith(linksMiddlewareMock());
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
        linksMiddlewareMock = require("../mock/middleware/links-middleware-mock")();
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
        restMiddleware = restMiddlewareFactory(helmetMock, linksMiddlewareMock, loggerMock, restifyMock, restifyCookiesMock, restifyLinks, restifyPlugins);
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
});
