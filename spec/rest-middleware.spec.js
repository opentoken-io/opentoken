"use strict";

describe("restMiddleware", () => {
    var configMock, helmetMock, logger, restMiddleware, serverMock, restifyLinks;

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
        configMock = {
            baseUrl: "http://localhost:8443",
            https: false
        };
        restifyLinks = jasmine.createSpy();
        logger = new LoggerMock();
        restMiddleware = new RestMiddleware(helmetMock, logger, restifyLinks);
    });

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

    it("calls restMiddleware without https", () => {
        restMiddleware(configMock, serverMock);

        expectNormalMiddlewareWasCalled();
        expect(helmetMock.hsts).not.toHaveBeenCalled();
    });
    it("calls restMiddleware with https", () => {
        configMock.https = true;
        restMiddleware(configMock, serverMock);

        expectNormalMiddlewareWasCalled();
        expect(helmetMock.hsts).toHaveBeenCalled();
    });
    it("sets up link discovery", () => {
        var next, req, res, standardLinks;
        res = jasmine.createSpyObj("resMock", [
            "links"
        ]);
        req = {
            href: function () {
                return "/path"
            }
        }
        spyOn(req, "href").andCallThrough();
        next = jasmine.createSpy("nextMock");

        restMiddleware(configMock, serverMock);

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