"use strict";

jasmine.routeTester("/", null, (routeTester) => {
    it("exports GET and a name", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name"
        ]);
    });
    describe("GET", () => {
        it("has no content", () => {
            return routeTester.get().then(() => {
                expect(routeTester.res.send).toHaveBeenCalledWith(204);
            });
        });
        it("adds service links", () => {
            return routeTester.get().then(() => {
                jasmine.checkLinks([
                    {
                        href: "rendered route: account-login, accountId:\"{accountId}\"",
                        profile: "/schema/account/login-request.json",
                        rel: "service",
                        templated: true,
                        title: "account-login"
                    },
                    {
                        href: "rendered route: registration-register",
                        profile: "/schema/registration/register-request.json",
                        rel: "service",
                        title: "registration-register"
                    }
                ], routeTester.res.linkObjects);
            });
        });
        it("calls server.get to serve static assets", () => {
            return routeTester.get().then(() => {
                expect(routeTester.server.get).toHaveBeenCalledWith(jasmine.any(RegExp), jasmine.any(Function));
            });
        });
    });
});
