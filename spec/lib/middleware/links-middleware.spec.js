"use strict";

describe("linksMiddleware", () => {
    var middlewareFactory, serverMock;

    beforeEach(() => {
        var fakeConfig;

        fakeConfig = {
            server: {
                baseUrl: "http://example.com:8000"
            }
        };
        serverMock = require("../../mock/server-mock")();
        middlewareFactory = require("../../../lib/middleware/links-middleware")(fakeConfig);
    });
    it("makes middleware", () => {
        expect(middlewareFactory(serverMock)).toEqual(jasmine.any(Function));
    });
    describe("middleware", () => {
        var middlewareAsync, req, res;

        beforeEach(() => {
            var middleware;

            req = require("../../mock/request-mock")();
            res = require("../../mock/response-mock")();
            middleware = middlewareFactory(serverMock);
            middlewareAsync = jasmine.middlewareToPromise(middleware);
        });
        describe("GET", () => {
            beforeEach(() => {
                return middlewareAsync(req, res);
            });
            it("adds appropriate links", () => {
                jasmine.checkLinks([
                    {
                        href: "rendered route: self-discovery",
                        rel: "up",
                        title: "self-discovery"
                    },
                    {
                        href: "http://example.com:8000/path",
                        rel: "self"
                    }
                ], res.linkObjects);
            });
        });
        describe("POST", () => {
            beforeEach(() => {
                req.method = "POST";

                return middlewareAsync(req, res);
            });
            it("adds appropriate links", () => {
                jasmine.checkLinks([
                    {
                        href: "rendered route: self-discovery",
                        rel: "up",
                        title: "self-discovery"
                    }
                ], res.linkObjects);
            });
        });
        describe("link caching", () => {
            beforeEach(() => {
                return middlewareAsync(req, res);
            });
            describe("second request", () => {
                beforeEach(() => {
                    // Flush the link objects
                    res.linkObjects = [];

                    // Break server route rendering
                    serverMock.router.render.and.returnValue("BROKEN");
                    req.method = "POST";

                    return middlewareAsync(req, res);
                });
                it("caches links", () => {
                    jasmine.checkLinks([
                        {
                            href: "rendered route: self-discovery",
                            rel: "up",
                            title: "self-discovery"
                        }
                    ], res.linkObjects);
                });
            });
        });
    });
});
