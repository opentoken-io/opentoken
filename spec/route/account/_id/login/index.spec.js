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
        it("clears the login cookie when one was set", (done) => {
            routeTester.req.cookies.login = "abcd";
            routeTester.get().then(() => {
                expect(routeTester.res.setCookie).toHaveBeenCalledWith("login", "");
            }).then(done, done);
        });
        it("does not bother with clearing the login cookie when one was not set", (done) => {
            routeTester.get().then(() => {
                expect(routeTester.res.setCookie).not.toHaveBeenCalled();
            }).then(done, done);
        });
        it("replies with the password hash configuration", (done) => {
            routeTester.get().then(() => {
                expect(routeTester.res.send).toHaveBeenCalledWith(200, {
                    passwordHashConfig: "loginHashConfig"
                });
            }).then(done, done);
        });
        it("adds service links", (done) => {
            routeTester.get().then(() => {
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
            }).then(done, done);
        });
    });
    describe("POST", () => {
        it("validates against a schema", (done) => {
            routeTester.post({}).then(() => {
                jasmine.fail();
                done();
            }, (err) => {
                expect(err).toBe(false);
                done();
            });
        });
        describe("with successful login", () => {
            beforeEach((done) => {
                routeTester.post({
                    challengeHash: "012345678901234567890123456789",
                    mfa: {
                        totp: "012345"
                    }
                }).then(done, done);
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
            it("does not log in", (done) => {
                routeTester.post({
                    challengeHash: "012345678901234567890123456789",
                    mfa: {
                        totp: "012345"
                    }
                }).then(() => {
                    jasmine.fail();
                }, (err) => {
                    expect(err).toBe("login-err");
                }).then(done, done);
            });
            it("clears the login cookie", (done) => {
                routeTester.req.cookies.login = "abcd";
                routeTester.post({
                    challengeHash: "012345678901234567890123456789",
                    mfa: {
                        totp: "012345"
                    }
                }).then(() => {
                    jasmine.fail();
                }, () => {
                    expect(routeTester.res.setCookie).toHaveBeenCalledWith("login", "");
                }).then(done, done);
            });
        });
    });
});
