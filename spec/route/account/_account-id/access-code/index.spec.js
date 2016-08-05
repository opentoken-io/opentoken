"use strict";

var accessCodeManagerMock, sessionManagerMock, validateSessionMiddlewareMock;

jasmine.routeTester("/account/_account-id/access-code/", (container) => {
    accessCodeManagerMock = require("../../../../mock/access-code-manager-mock")();
    sessionManagerMock = require("../../../../mock/session-manager-mock")();
    validateSessionMiddlewareMock = require("../../../../mock/middleware/validate-session-middleware-mock")();
    container.register("accessCodeManager", accessCodeManagerMock);
    container.register("sessionManager", sessionManagerMock);
    container.register("validateSessionMiddleware", validateSessionMiddlewareMock);
}, (routeTester) => {
    beforeEach(() => {
        routeTester.req.params.accountId = "accountId";
        routeTester.req.cookies.login = "asdf";
    });
    it("exports GET, name, and POST", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name",
            "post"
        ]);
    });
    describe("GET", () => {
        describe("success", () => {
            beforeEach(() => {
                return routeTester.get();
            });
            it("returns no value", () => {
                expect(routeTester.res.send).toHaveBeenCalledWith(204);
            });
            it("creates the right links", () => {
                jasmine.checkLinks([
                    {
                        href: "rendered route: account-accessCode, accountId:\"accountId\"",
                        profile: "/schema/account/access-code-request.json",
                        rel: "service",
                        title: "account-accessCode"
                    },
                    {
                        href: "rendered route: account, accountId:\"accountId\"",
                        rel: "up",
                        title: "account"
                    }
                ], routeTester.res.linkObjects);
            });
        });
    });
    describe("POST", () => {
        it("checks data against a schema and fails if it has a bad structure", () => {
            return routeTester.post({
                description: 7
            }).then(jasmine.fail, () => {
                return;
            });
        });
        it("requires a valid session", () => {
            // Just ensure the middleware was called
            return routeTester.post({}).then(() => {
                // Yes, call this factory to return the real middleware spy.
                // See the mock for details.
                expect(validateSessionMiddlewareMock()).toHaveBeenCalled();
            });
        });
        it("creates a resource", () => {
            return routeTester.post({}).then(() => {
                expect(routeTester.res.send).toHaveBeenCalledWith(201, "createdId and other info");
            });
        });
        it("works without a description", () => {
            return routeTester.post({}).then(() => {
                expect(accessCodeManagerMock.createAsync).toHaveBeenCalledWith("accountId", {});
            });
        });
        it("passes a filled in description", () => {
            return routeTester.post({
                description: "testing"
            }).then(() => {
                expect(accessCodeManagerMock.createAsync).toHaveBeenCalledWith("accountId", {
                    description: "testing"
                });
            });
        });
    });
});
