"use strict";

var registrationManagerMock;

jasmine.routeTester("/registration", (container) => {
    registrationManagerMock = require("../../mock/registration-manager-mock")();
    container.register("registrationManager", registrationManagerMock);
}, (routeTester) => {
    it("exports the right methods", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "name",
            "post"
        ]);
    });
    describe("POST", () => {
        it("validates against a schema", () => {
            return routeTester.post({}).then(jasmine.fail, (err) => {
                expect(err).toBe(false);
            });
        });
        it("registers", () => {
            return routeTester.post({
                email: "test@example.org"
            }).then(() => {
                expect(registrationManagerMock.registerAsync).toHaveBeenCalledWith({
                    email: "test@example.org"
                });
                expect(routeTester.res.linkObjects).toEqual([
                    {
                        href: "rendered route: registration-secure, id:\"id\"",
                        rel: "self"
                    },
                    {
                        href: "rendered route: registration-secure, id:\"id\"",
                        profile: "/schema/registration/secure-request.json",
                        rel: "edit",
                        title: "registration-secure"
                    },
                    {
                        href: "rendered route: registration-secure-qr, id:\"id\"",
                        rel: "item",
                        title: "registration-secure-qr"
                    }
                ]);
                expect(routeTester.res.send).toHaveBeenCalledWith({
                    secure: "info"
                });
            });
        });
    });
});
