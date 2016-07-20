"use strict";

var accountManagerMock, promiseMock;

jasmine.routeTester("/account/_id/login/", (container) => {
    promiseMock = require("../../../../mock/promise-mock")();
    accountManagerMock = require("../../../../mock/account-manager-mock")();
    container.register("accountManager", accountManagerMock);
}, (routeTester) => {
    beforeEach(() => {
        routeTester.req.params.id = "account-id";
    });
    it("exports GET, POST and a name", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name",
            "post"
        ]);
    });
    describe("GET", () => {
        it("clears the login cookie when one was set", () => {
            routeTester.req.cookies.login = "abcd";

            return routeTester.get().then(() => {
                expect(routeTester.res.setCookie).toHaveBeenCalledWith("login", "");
            });
        });
        it("does not bother with clearing the login cookie when one was not set", () => {
            return routeTester.get().then(() => {
                expect(routeTester.res.setCookie).not.toHaveBeenCalled();
            });
        });
        it("replies with the password hash configuration", () => {
            return routeTester.get().then(() => {
                expect(routeTester.res.send).toHaveBeenCalledWith(200, {
                    passwordHashConfig: "loginHashConfig"
                });
            });
        });
        it("adds service links", () => {
            return routeTester.get().then(() => {
                expect(routeTester.res.linkObjects).toEqual([
                    {
                        href: "rendered route: account, id:\"account-id\"",
                        rel: "item",
                        title: "account"
                    },
                    {
                        href: "rendered route: account-login, id:\"account-id\"",
                        profile: "/schema/account/login-request.json",
                        rel: "service",
                        title: "account-login"
                    }
                ]);
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
                expect(routeTester.res.setCookie).toHaveBeenCalledWith("login", "login-session-id", {
                    httpOnly: true,
                    maxAge: jasmine.any(Number),
                    path: "/account/",
                    secure: true
                });
            });
            it("creates the right links", () => {
                expect(routeTester.res.linkObjects).toEqual([
                    {
                        href: "rendered route: account, id:\"account-id\"",
                        rel: "item",
                        title: "account"
                    }
                ]);
            });
            it("redirects to the account page", () => {
                expect(routeTester.res.header).toHaveBeenCalledWith("Location", "rendered route: account, id:\"account-id\"");
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
                    expect(routeTester.res.setCookie).toHaveBeenCalledWith("login", "");
                });
            });
        });
    });
});
