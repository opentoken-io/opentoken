"use strict";

var registrationManagerMock;

jasmine.routeTester("/registration/_id/confirm/_code", (container) => {
    registrationManagerMock = require("../../../../../mock/registration-manager-mock")();
    container.register("registrationManager", registrationManagerMock);
}, (routeTester) => {
    it("exports the right methods", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name"
        ]);
    });
    describe("GET", () => {
        it("confirms the registration", (done) => {
            routeTester.req.params.id = "id";
            routeTester.req.params.code = "code";
            routeTester.get().then(() => {
                expect(registrationManagerMock.confirmEmailAsync).toHaveBeenCalledWith("id", "code");
                expect(routeTester.res.linkObjects).toEqual([
                    {
                        href: "rendered route: account, id:\"account id\"",
                        rel: "self"
                    },
                    {
                        href: "rendered route: account-login, id:\"account id\"",
                        profile: "/schema/account/login-request.json",
                        rel: "service",
                        title: "account-login"
                    }
                ]);
                expect(routeTester.res.send).toHaveBeenCalledWith(201, {
                    accountId: "account id"
                });
            }).then(done, done);
        });
    });
});
