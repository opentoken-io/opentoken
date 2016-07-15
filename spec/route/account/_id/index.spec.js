"use strict";

var accountManagerMock, promiseMock, sessionManagerMock;

jasmine.routeTester("/account/_id/", (container) => {
    accountManagerMock = require("../../../mock/account-manager-mock")();
    promiseMock = require("../../../mock/promise-mock")();
    sessionManagerMock = require("../../../mock/session-manager-mock")();
    container.register("accountManager", accountManagerMock);
    container.register("sessionManager", sessionManagerMock);
}, (routeTester) => {
    beforeEach(() => {
        routeTester.req.params.id = "account-id";
    });
    it("exports GET and a name", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name"
        ]);
    });

    describe("GET", () => {
        describe("success", () => {
            beforeEach((done) => {
                routeTester.req.cookies.login = "asdf";
                routeTester.get().then(done);
            });
            it("refreshes the login cookie", () => {
                expect(routeTester.res.setCookie).toHaveBeenCalledWith("login", "asdf", {
                    httpOnly: true,
                    maxAge: jasmine.any(Number),
                    path: "/account/",
                    secure: true
                });
            });
            it("returns the account record", () => {
                expect(routeTester.res.send).toHaveBeenCalledWith(200, {
                    challengeHashConfig: "record-challenge-hash-config",
                    email: "record-email",
                    passwordHashConfig: "record-password-hash-config"
                });
            });
            it("creates the right links", () => {
                expect(routeTester.res.linkObjects).toEqual([
                    {
                        href: "rendered route: account-logout, id:\"account-id\"",
                        profile: "/schema/account/logout.json",
                        rel: "service",
                        title: "account-logout"
                    }
                ]);
            });
        });

        // This can't happen because the cookie value is used for login.
        // However, assuming it *could* happen, let's make sure that
        // we do not permit this sort of behavior.  Because the managers
        // are mocked to allow any value, we can simulate this bizarre
        // behavior quite easily.
        describe("no login cookie to refresh", () => {
            it("errors when refreshing the login cookie", (done) => {
                routeTester.get().then(() => {
                    jasmine.fail();
                }, (err) => {
                    expect(err.toString()).toContain("No login cookie to refresh");
                }).then(done, done);
            });
        });

        // Failure scenarios
        [
            {
                getSpy: () => {
                    return sessionManagerMock.validateAsync;
                },
                name: "invalid session"
            },
            {
                getSpy: () => {
                    return accountManagerMock.recordAsync;
                },
                name: "invalid account"
            }
        ].forEach((scenario) => {
            describe(scenario.name, () => {
                beforeEach(() => {
                    scenario.getSpy().andReturn(promiseMock.reject(scenario.name));
                });
                it("returns an error", (done) => {
                    routeTester.get().then(() => {
                        expect(routeTester.res.send).toHaveBeenCalledWith(401);
                    }).then(done, done);
                });
                it("clears login cookies", (done) => {
                    routeTester.req.cookies.login = "abcd";
                    routeTester.get().then(() => {
                        expect(routeTester.res.setCookie).toHaveBeenCalledWith("login", "");
                    }).then(done, done);
                });
                it("sets the right links", (done) => {
                    routeTester.get().then(() => {
                        expect(routeTester.res.linkObjects).toEqual([
                            {
                                href: "rendered route: account-login, id:\"account-id\"",
                                rel: "item",
                                title: "account-login"
                            }
                        ]);
                    }).then(done, done);
                });
            });
        });
    });
});
