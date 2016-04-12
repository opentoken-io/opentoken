"use strict";

describe("restMiddleware", () => {
    var helmetMock, logger, restMiddleware, serverMock, restifyLinks;

    /**
     * Tests the common middleware set up when calling restMiddleware.
     * StandardLinks is tested on it's own due to the nature of what
     * needs to be tested there.
     */
    function expectNormalMiddlewareWasCalled () {
        expect(helmetMock.frameguard).toHaveBeenCalled();
        expect(helmetMock.ieNoOpen).toHaveBeenCalled();
        expect(helmetMock.hidePoweredBy).toHaveBeenCalled();
        expect(helmetMock.ieNoOpen).toHaveBeenCalled();
        expect(helmetMock.noCache).toHaveBeenCalled();
        expect(helmetMock.noSniff).toHaveBeenCalled();
        expect(helmetMock.xssFilter).toHaveBeenCalled();
        expect(restifyLinks).toHaveBeenCalled();
    }

    beforeEach(() => {
        var LoggerMock, RestMiddleware;

        RestMiddleware = require("../lib/rest-middleware");
        LoggerMock = require("./mock/logger-mock");
        helmetMock = jasmine.createSpyObj("helmetMock", [
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
        restifyLinks = jasmine.createSpy();
        logger = new LoggerMock();
        restMiddleware = new RestMiddleware(helmetMock, logger, restifyLinks);
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