"use strict";

describe("restMiddleware", () => {
    var configMock, HelmetMock, logger, restMiddleware, ServerMock, restifyLinks;

    beforeEach(() => {
        var LoggerMock, RestMiddleware;

        RestMiddleware = require("../lib/rest-middleware");
        LoggerMock = require("./mock/logger-mock");
        HelmetMock = jasmine.createSpyObj("helmetMock", [
            "frameguard",
            "hidePoweredBy",
            "hsts",
            "ieNoOpen",
            "noCache",
            "noSniff",
            "xssFilter"
        ]);
        ServerMock = jasmine.createSpyObj("serverMock", [
            "use"
        ]);
        configMock = {
            baseUrl: "http://localhost:8443",
            https: false
        };
        restifyLinks = jasmine.createSpy();
        logger = new LoggerMock();
        restMiddleware = new RestMiddleware(HelmetMock, logger, restifyLinks);
    });

    it("calls restMiddleware without https", () => {
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
        restMiddleware(configMock, ServerMock);
        expect(logger.debug).toHaveBeenCalled();
        expect(HelmetMock.frameguard).toHaveBeenCalled();
        expect(HelmetMock.ieNoOpen).toHaveBeenCalled();
        expect(HelmetMock.hidePoweredBy).toHaveBeenCalled();
        expect(HelmetMock.hsts).not.toHaveBeenCalled();
        expect(HelmetMock.ieNoOpen).toHaveBeenCalled();
        expect(HelmetMock.noCache).toHaveBeenCalled();
        expect(HelmetMock.noSniff).toHaveBeenCalled();
        expect(HelmetMock.xssFilter).toHaveBeenCalled();
        expect(restifyLinks).toHaveBeenCalled();
        standardLinks = ServerMock.use.mostRecentCall.args[0];
        expect(standardLinks).toEqual(jasmine.any(Function));
        standardLinks(req, res, next);
        expect(res.links).toHaveBeenCalledWith({
            self: "http://localhost:8443/path",
            up: {
                href: "http://localhost:8443/",
                title: "self-discovery"
            }
        });
    });

    it("calls restMiddleware with https", () => {
        configMock.https = true;
        restMiddleware(configMock, ServerMock);

        // Other calls are tested above
        expect(HelmetMock.hsts).toHaveBeenCalled();
    });
});