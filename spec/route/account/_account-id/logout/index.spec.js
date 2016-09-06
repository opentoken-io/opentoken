"use strict";

var loginCookieMock;

jasmine.routeTester("/account/_account-id/logout/", (container) => {
    var accountManagerMock;

    accountManagerMock = require("../../../../mock/manager/account-manager-mock")();
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

    // GET and POST operate identically
    [
        "get",
        "post"
    ].forEach((method) => {
        describe(`"${method}"`, () => {
            it("has no content", () => {
                return routeTester[method]().then(() => {
                    expect(routeTester.res.send).toHaveBeenCalledWith(204);
                });
            });
            it("redirects", () => {
                return routeTester[method]().then(() => {
                    expect(routeTester.res.header).toHaveBeenCalledWith("Location", jasmine.any(String));
                });
            });
            it("clears the login cookie", () => {
                return routeTester[method]().then(() => {
                    expect(loginCookieMock.clear).toHaveBeenCalledWith(routeTester.req, routeTester.res);
                });
            });
        });
    });
});
