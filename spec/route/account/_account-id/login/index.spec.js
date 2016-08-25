"use strict";

var accountManagerMock, loginCookieMock, promiseMock;

jasmine.routeTester("/account/_account-id/login/", (container) => {
    promiseMock = require("../../../../mock/promise-mock")();
    accountManagerMock = require("../../../../mock/account-manager-mock")();
    loginCookieMock = require("../../../../mock/login-cookie-mock")();
    container.register("accountManager", accountManagerMock);
    container.register("loginCookie", loginCookieMock);
}, (routeTester) => {
    beforeEach(() => {
        routeTester.req.params.accountId = "account-id";
    });
    it("exports GET, POST and a name", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name",
            "post"
        ]);
    });
    describe("GET", () => {
        it("clears the login cookie", () => {
            return routeTester.get().then(() => {
                expect(loginCookieMock.clear).toHaveBeenCalledWith(routeTester.req, routeTester.res);
            });
        });
        it("replies with the password hash configuration", () => {
            return routeTester.get().then(() => {
                expect(routeTester.res.send).toHaveBeenCalledWith(200, "loginHashConfig");
            });
        });
        it("adds service links", () => {
            return routeTester.get().then(() => {
                jasmine.checkLinks([
                    {
                        href: "rendered route: account-login, accountId:\"account-id\"",
                        profile: "/schema/account/login-request.json",
                        rel: "service",
                        title: "account-login"
                    },
                    {
                        href: "rendered route: account, accountId:\"account-id\"",
                        rel: "up",
                        title: "account"
                    }
                ], routeTester.res.linkObjects);
            });
        });
    });
    describe("POST", () => {
        it("validates against a schema", () => {
            return routeTester.post({}).then(jasmine.fail, (err) => {
                expect(err).toBe(false);
            });
        });
        describe("with successful login", () => {
            beforeEach(() => {
                return routeTester.post({
                    challengeHash: "012345678901234567890123456789",
                    mfa: {
                        totp: "012345"
                    }
                });
            });
            it("logs in", () => {
                expect(routeTester.res.send).toHaveBeenCalledWith(200, {
                    sessionId: "login-session-id"
                });
            });
            it("sets a login cookie", () => {
                expect(loginCookieMock.set).toHaveBeenCalledWith(routeTester.res, "login-session-id");
            });
            it("creates the right links", () => {
                jasmine.checkLinks([
                    {
                        href: "rendered route: account, accountId:\"account-id\"",
                        rel: "up",
                        title: "account"
                    }
                ], routeTester.res.linkObjects);
            });
            it("redirects to the account page", () => {
                expect(routeTester.res.header).toHaveBeenCalledWith("Location", "rendered route: account, accountId:\"account-id\"");
            });
        });
        describe("with failed login", () => {
            beforeEach(() => {
                accountManagerMock.loginAsync.andReturn(promiseMock.reject("login-err"));
            });
            it("does not log in", () => {
                return routeTester.post({
                    challengeHash: "012345678901234567890123456789",
                    mfa: {
                        totp: "012345"
                    }
                }).then(jasmine.fail, (err) => {
                    expect(err).toBe("login-err");
                });
            });
            it("clears the login cookie", () => {
                routeTester.req.cookies.login = "abcd";

                return routeTester.post({
                    challengeHash: "012345678901234567890123456789",
                    mfa: {
                        totp: "012345"
                    }
                }).then(jasmine.fail, () => {
                    expect(loginCookieMock.clear).toHaveBeenCalledWith(routeTester.req, routeTester.res);
                });
            });
        });
    });
});
