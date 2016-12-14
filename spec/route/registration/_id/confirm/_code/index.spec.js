"use strict";

var registrationManagerMock;

jasmine.routeTester("/registration/_id/confirm/_code", (container) => {
    registrationManagerMock = require("../../../../../mock/manager/registration-manager-mock")();
    container.register("registrationManager", registrationManagerMock);
}, (routeTester) => {
    it("exports the right methods", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name"
        ]);
    });
    describe("GET", () => {
        it("confirms the registration", () => {
            routeTester.req.params.id = "id";
            routeTester.req.params.code = "code";

            return routeTester.get().then(() => {
                expect(registrationManagerMock.confirmEmailAsync).toHaveBeenCalledWith("id", "code");
                jasmine.checkLinks([
                    {
                        href: "rendered route: self-discovery",
                        rel: "up"
                    },
                    {
                        href: "rendered route: account, accountId:\"account id\"",
                        rel: "self"
                    },
                    {
                        href: "rendered route: account-login, accountId:\"account id\"",
                        profile: "/schema/account/login-request.json",
                        rel: "service",
                        title: "account-login"
                    }
                ], routeTester.res.linkObjects);
                expect(routeTester.res.send).toHaveBeenCalledWith(201, {
                    accountId: "account id"
                });
            });
        });
    });
});
