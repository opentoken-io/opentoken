"use strict";

describe("restMiddleware", () => {
    var helmetMock, restifyLinks, restifyMock, restMiddleware, serverMock;

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
            restifyMock.CORS
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
        serverMock = jasmine.createSpyObj("serverMock", [
            "use"
        ]);
        restifyMock = mockMiddleware("restifyMock", [
            "CORS"
        ]);
        restifyLinks = jasmine.createSpy("restifyLinks");
        restifyLinks.andReturn(restifyLinks);
        restMiddleware = restMiddlewareFactory(helmetMock, loggerMock, restifyMock, restifyLinks);
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
    describe("self-discovery links", () => {
        var linkFunction, links, next, req, res;

        beforeEach(() => {
            links = [];
            next = jasmine.createSpy("nextMock");
            res = jasmine.createSpyObj("resMock", [
                "links"
            ]);
            res.links.andCallFake((linkObj) => {
                Object.keys(linkObj).forEach((rel) => {
                    var linkVals;

                    linkVals = [].concat(linkObj[rel]);
                    linkVals.forEach((linkVal) => {
                        if (typeof linkVal === "string") {
                            linkVal = {
                                href: linkVal
                            };
                        }

                        linkVal.rel = rel;
                        links.push(linkVal);
                    });
                });
            });
            req = jasmine.createSpyObj("reqMock", [
                "href"
            ]);
            req.href.andReturn("/path");
            req.method = "GET";
            restMiddleware({
                baseUrl: "http://localhost:8443",
                https: false
            }, serverMock);
            linkFunction = serverMock.use.mostRecentCall.args[0];
        });
        it("set up for GET", () => {
            expect(() => {
                linkFunction(req, res, next);
            }).not.toThrow();
            expect(links).toEqual([
                {
                    href: "http://localhost:8443/",
                    rel: "up",
                    title: "self-discovery"
                },
                {
                    href: "http://localhost:8443/path",
                    rel: "self"
                }
            ]);
        });
        it("set up for POST", () => {
            req.method = "POST";
            expect(() => {
                linkFunction(req, res, next);
            }).not.toThrow();
            expect(links).toEqual([
                {
                    href: "http://localhost:8443/",
                    rel: "up",
                    title: "self-discovery"
                }
            ]);
        });
    });
});
