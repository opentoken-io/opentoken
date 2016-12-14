"use strict";

describe("validateSessionMiddleware", () => {
    var ErrorResponse, loginCookieMock, middlewareFactory, promiseMock, sessionManagerMock;

    beforeEach(() => {
        loginCookieMock = require("../../mock/login-cookie-mock")();
        sessionManagerMock = require("../../mock/manager/session-manager-mock")();
        promiseMock = require("../../mock/promise-mock")();
        ErrorResponse = require("../../../lib/error-response")(promiseMock);
        middlewareFactory = require("../../../lib/middleware/validate-session-middleware")(ErrorResponse, loginCookieMock, sessionManagerMock);
    });
    describe("middleware", () => {
        var middlewareAsync, req, res, serverMock;

        beforeEach(() => {
            serverMock = require("../../mock/server-mock")();
            req = require("../../mock/request-mock")();
            res = require("../../mock/response-mock")();
            middlewareAsync = jasmine.middlewareToPromise(middlewareFactory(serverMock));
        });
        describe("with a valid session", () => {
            // This also tests that `next()` had no parameters due to how
            // the middlewareToPromise helper works.
            it("refreshes the login cookie", () => {
                return middlewareAsync(req, res).then(() => {
                    expect(loginCookieMock.refresh).toHaveBeenCalledWith(req, res);
                });
            });
        });
        describe("when sessionManager rejects the session", () => {
            beforeEach(() => {
                sessionManagerMock.validateAsync.andCallFake(() => {
                    return promiseMock.reject("x");
                });
            });
            it("sends an error response", () => {
                return middlewareAsync(req, res).then(jasmine.fail, () => {
                    expect(res.send).toHaveBeenCalledWith(403, jasmine.any(ErrorResponse));
                    expect(res.send.mostRecentCall.args[1].code).toEqual("8gzh4j1A");
                    expect(res.send.mostRecentCall.args[1].message).toEqual("Session is invalid.");
                });
            });
            it("passes a value to \"next\"", () => {
                return middlewareAsync(req, res).then(jasmine.fail, (err) => {
                    // `next(false)` should be called.  That `false`
                    // value would be the rejected Promise's value.
                    expect(err).toBe(false);
                });
            });
            describe("with an accountId parameter", () => {
                beforeEach(() => {
                    req.params.accountId = "accountId";
                });
                it("generates a link to login for an account", () => {
                    return middlewareAsync(req, res).then(jasmine.fail, () => {
                        jasmine.checkLinks([
                            {
                                href: "rendered route: account-login, accountId:\"accountId\"",
                                profile: "/schema/account/login-request.json",
                                rel: "service",
                                title: "account-login"
                            }
                        ], res.linkObjects);
                    });
                });
                it("sends a Location header to the login endpoint", () => {
                    return middlewareAsync(req, res).then(jasmine.fail, () => {
                        expect(res.header).toHaveBeenCalledWith("Location", "rendered route: account-login, accountId:\"accountId\"");
                    });
                });
            });
            describe("without an accountId parameter", () => {
                it("generates a templated link", () => {
                    return middlewareAsync(req, res).then(jasmine.fail, () => {
                        jasmine.checkLinks([
                            {
                                href: "rendered route: account-login, accountId:\"{accountId}\"",
                                profile: "/schema/account/login-request.json",
                                rel: "service",
                                templated: true,
                                title: "account-login"
                            }
                        ], res.linkObjects);
                    });
                });
                it("sends a Location header to the self-discovery endpoint", () => {
                    return middlewareAsync(req, res).then(jasmine.fail, () => {
                        expect(res.header).toHaveBeenCalledWith("Location", "rendered route: self-discovery");
                    });
                });
                it("caches the self-discovery link for speed", () => {
                    return middlewareAsync(req, res).then(jasmine.fail, () => {
                        // This will prove that the route is not rendered again
                        serverMock.router.render.andReturn("If this is returned the result was not cached");

                        // Replace the spy to remove the previous calls
                        res.header = jasmine.createSpy("response header");

                        return middlewareAsync(req, res);
                    }).then(jasmine.fail, () => {
                        expect(res.header).toHaveBeenCalledWith("Location", "rendered route: self-discovery");
                    });
                });
            });
        });
    });
});
