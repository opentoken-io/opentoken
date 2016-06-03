"use strict";

jasmine.routeTester("/", null, (routeTester) => {
    it("exports GET and a name", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name"
        ]);
    });
    describe("GET", () => {
        it("has no content", (done) => {
            routeTester.get().then(() => {
                expect(routeTester.res.send).toHaveBeenCalledWith(204);
            }).then(done, done);
        });
        it("adds service links", (done) => {
            routeTester.get().then(() => {
                expect(routeTester.res.linkObjects).toEqual([
                    {
                        href: "rendered route: registration-register",
                        profile: "/schema/registration/register-request.json",
                        rel: "service",
                        title: "registration-register"
                    }
                ]);
            }).then(done, done);
        });
        it("calls server.get to serve static assets", (done) => {
            routeTester.get().then(() => {
                expect(routeTester.server.get).toHaveBeenCalledWith(jasmine.any(RegExp), jasmine.any(Function));
            }).then(done, done);
        });
    });
});
