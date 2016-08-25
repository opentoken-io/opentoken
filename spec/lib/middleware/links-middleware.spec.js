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
        var middleware, req, res;

        beforeEach(() => {
            req = require("../../mock/request-mock")();
            res = require("../../mock/response-mock")();
            middleware = middlewareFactory(serverMock);
        });
        describe("GET", () => {
            beforeEach((done) => {
                middleware(req, res, done);
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
            beforeEach((done) => {
                req.method = "POST";
                middleware(req, res, done);
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
            beforeEach((done) => {
                middleware(req, res, done);
            });
            describe("second request", () => {
                beforeEach((done) => {
                    // Flush the link objects
                    res.linkObjects = [];

                    // Break server route rendering
                    serverMock.router.render.andReturn("BROKEN");
                    req.method = "POST";
                    middleware(req, res, done);
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
