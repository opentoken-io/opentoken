"use strict";

describe("restMiddleware", () => {
    var helmetMock, restMiddleware, serverMock, restifyMock, restifyLinks;

    /**
     * Tests the common middleware set up when calling restMiddleware.
     * StandardLinks is tested on it's own due to the nature of what
     * needs to be tested there.
     */
    function expectNormalMiddlewareWasCalled () {
        [
            helmetMock.frameguard,
            helmetMock.ieNoOpen,
            helmetMock.hidePoweredBy,
            helmetMock.noCache,
            helmetMock.noSniff,
            helmetMock.xssFilter,
            restifyMock.CORS,
            restifyLinks
        ].forEach((spy) => {
            expect(spy).toHaveBeenCalled();
            expect(serverMock.use).toHaveBeenCalledWith(spy);
        });
    }

    function mockMiddleware(name, methods) {
        var middleware;

        middleware = jasmine.createSpyObj(name, methods);
        methods.forEach((methodName) => {
            middleware[methodName].andReturn(middleware[methodName]);
        });

        return middleware;
    }

    beforeEach(() => {
        var loggerMock, RestMiddleware;

        RestMiddleware = require("../lib/rest-middleware");
        loggerMock = require("./mock/logger-mock");
        helmetMock = mockMiddleware("helmetMock", [
            "frameguard",
            "hidePoweredBy",
            "hsts",
            "ieNoOpen",
            "noCache",
            "noSniff",
            "xssFilter"
        ]);
        serverMock = jasmine.createSpyObj("serverMock", [
            "use"
        ]);
        restifyMock = mockMiddleware("restifyMock", [
            "CORS"
        ]);
        restifyLinks = jasmine.createSpy("restifyLinks");
        restifyLinks.andReturn(restifyLinks);
        restMiddleware = new RestMiddleware(helmetMock, loggerMock, restifyMock, restifyLinks);
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
    it("sets up self-discovery links", () => {
        var next, req, res, standardLinks;

        res = jasmine.createSpyObj("resMock", [
            "links"
        ]);
        req = jasmine.createSpyObj("reqMock", [
            "href"
        ]);
        req.href.andReturn("/path");
        next = jasmine.createSpy("nextMock");
        restMiddleware({
            baseUrl: "http://localhost:8443",
            https: false
        }, serverMock);
        standardLinks = serverMock.use.mostRecentCall.args[0];
        expect(standardLinks).toEqual(jasmine.any(Function));
        expect(() => {
            standardLinks(req, res, next);
        }).not.toThrow();
        expect(res.links).toHaveBeenCalledWith({
            self: "http://localhost:8443/path",
            up: {
                href: "http://localhost:8443/",
                title: "self-discovery"
            }
        });
    });
});
