"use strict";

var accountManagerMock, promiseMock, validateSessionMiddlewareMock;

jasmine.routeTester("/account/_account-id/", (container) => {
    accountManagerMock = require("../../../mock/manager/account-manager-mock")();
    promiseMock = require("../../../mock/promise-mock")();
    validateSessionMiddlewareMock = require("../../../mock/middleware/validate-session-middleware-mock")();
    container.register("accountManager", accountManagerMock);
    container.register("validateSessionMiddleware", validateSessionMiddlewareMock);
}, (routeTester) => {
    beforeEach(() => {
        routeTester.req.params.accountId = "account-id";
    });
    it("exports GET and a name", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name"
        ]);
    });
    describe("GET", () => {
        describe("success", () => {
            beforeEach(() => {
                routeTester.req.cookies.login = "asdf";

                return routeTester.get();
            });
            it("validated the session", () => {
                expect(validateSessionMiddlewareMock()).toHaveBeenCalled();
            });
            it("returns the account record", () => {
                expect(routeTester.res.send).toHaveBeenCalledWith(200, {
                    challengeHashConfig: "record-challenge-hash-config",
                    email: "record-email",
                    passwordHashConfig: "record-password-hash-config"
                });
            });
            it("creates the right links", () => {
                jasmine.checkLinks([
                    {
                        href: "rendered route: account-accessCode, accountId:\"account-id\"",
                        profile: "/schema/account/access-code-request.json",
                        rel: "service",
                        title: "account-accessCode"
                    },
                    {
                        href: "rendered route: account-logout, accountId:\"account-id\"",
                        profile: "/schema/account/logout-request.json",
                        rel: "service",
                        title: "account-logout"
                    },
                    {
                        href: "rendered route: account-token-create, accountId:\"account-id\"{?public}",
                        profile: "/schema/account/token-create-request.json",
                        rel: "service",
                        templated: true,
                        title: "account-tokenCreate"
                    }
                ], routeTester.res.linkObjects);
            });
        });

        describe("invalid account", () => {
            // Really, this shouldn't happen.  If the session exists,
            // the account should exist as well.
            beforeEach(() => {
                accountManagerMock.recordAsync.andCallFake(() => {
                    return promiseMock.reject(new Error("something is wrong"));
                });
            });
            it("returns an error", () => {
                return routeTester.get().then(jasmine.fail, () => {
                    expect(routeTester.res.send).not.toHaveBeenCalled();
                });
            });
        });
    });
});
