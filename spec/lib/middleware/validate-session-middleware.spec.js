"use strict";

describe("validateSessionMiddleware", () => {
    var loginCookieMock, middlewareFactory, promiseMock, sessionManagerMock;

    beforeEach(() => {
        var errorResponseMock;

        errorResponseMock = require("../../mock/error-response-mock")();
        loginCookieMock = require("../../mock/login-cookie-mock")();
        sessionManagerMock = require("../../mock/session-manager-mock")();
        promiseMock = require("../../mock/promise-mock")();
        middlewareFactory = require("../../../lib/middleware/validate-session-middleware")(errorResponseMock, loginCookieMock, sessionManagerMock);
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
                sessionManagerMock.validateAsync.andReturn(promiseMock.reject("x"));
            });
            it("sends an error response", () => {
                return middlewareAsync(req, res).then(jasmine.fail, () => {
                    expect(res.send).toHaveBeenCalledWith(403, {
                        code: "8gzh4j1A",
                        logRef: "fakeLogRef",
                        message: "Session is invalid."
                    });
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
            });
        });
    });
});
