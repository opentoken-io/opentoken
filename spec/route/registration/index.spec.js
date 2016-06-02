"use strict";

jasmine.routeTester("/registration", (container) => {
    var promiseMock, registrationManagerMock;

    promiseMock = require("../../mock/promise-mock")();
    registrationManagerMock = jasmine.createSpyObj("registrationManager", [
        "registerAsync"
    ]);
    registrationManagerMock.registerAsync.andReturn(promiseMock.resolve({
        id: "id",
        secureInfo: {
            secure: "info"
        }
    }));
    container.register("registrationManager", registrationManagerMock);
}, (routeTester) => {
    it("exports the right methods", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "name",
            "post"
        ]);
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
        it("registers", (done) => {
            routeTester.post({
                email: "test@example.org"
            }).then(() => {
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
            }).then(done, done);
        });
    });
});
