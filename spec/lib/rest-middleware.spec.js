"use strict";

describe("restMiddleware", () => {
    var helmetMock, linksMiddlewareMock, nocacheMock, requestLoggerMiddlewareMock, restifyCookiesMock, restifyLinks, restifyMock, restMiddleware, serverMock;

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
            helmetMock.noSniff,
            helmetMock.xssFilter,
            nocacheMock,
            restifyLinks,
            restifyMock.plugins.acceptParser,
            restifyMock.plugins.gzipResponse,
            restifyMock.plugins.queryParser
        ].forEach((spy) => {
            expect(spy).toHaveBeenCalled();
            expect(serverMock.use).toHaveBeenCalledWith(spy);
        });

        // This one middleware works correctly.  Its factory does not
        // return the factory.  It returns the middleware properly.
        expect(linksMiddlewareMock).toHaveBeenCalled();
        expect(serverMock.use).toHaveBeenCalledWith(linksMiddlewareMock());

        // Not a factory
        expect(serverMock.use).toHaveBeenCalledWith(requestLoggerMiddlewareMock);
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
            middleware[methodName].and.returnValue(middleware[methodName]);
        });

        return middleware;
    }

    beforeEach(() => {
        var loggerMock, restMiddlewareFactory;

        nocacheMock = jasmine.createSpy("nocacheMock");
        nocacheMock.and.returnValue(nocacheMock);
        restMiddlewareFactory = require("../../lib/rest-middleware");
        linksMiddlewareMock = require("../mock/middleware/links-middleware-mock")();
        loggerMock = require("../mock/logger-mock")();
        helmetMock = mockMiddleware("helmetMock", [
            "frameguard",
            "hidePoweredBy",
            "hsts",
            "ieNoOpen",
            "noSniff",
            "xssFilter"
        ]);
        serverMock = require("../mock/server-mock")();
        requestLoggerMiddlewareMock = jasmine.createSpy("requestLoggerMiddlewareMock");
        requestLoggerMiddlewareMock.and.returnValue(requestLoggerMiddlewareMock);
        restifyMock = {
            plugins: mockMiddleware("restify.plugins", [
                "acceptParser",
                "gzipResponse",
                "queryParser"
            ])
        };
        restifyLinks = jasmine.createSpy("restifyLinks");
        restifyLinks.and.returnValue(restifyLinks);
        restifyCookiesMock = jasmine.createSpyObj("restifyCookies", [
            "parse"
        ]);
        restMiddleware = restMiddlewareFactory(helmetMock, linksMiddlewareMock, loggerMock, nocacheMock, requestLoggerMiddlewareMock, restifyMock, restifyCookiesMock, restifyLinks);
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
