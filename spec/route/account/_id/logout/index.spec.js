"use strict";

jasmine.routeTester("/account/_id/logout/", null, (routeTester) => {
    beforeEach(() => {
        routeTester.req.params.id = "account-id";
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
        "GET",
        "POST"
    ].forEach((methodUpper) => {
        var methodLower;

        methodLower = methodUpper.toLowerCase();
        describe(methodUpper, () => {
            it("has no content", (done) => {
                routeTester[methodLower]().then(() => {
                    expect(routeTester.res.send).toHaveBeenCalledWith(204);
                }).then(done, done);
            });
            it("redirects", (done) => {
                routeTester[methodLower]().then(() => {
                    expect(routeTester.res.header).toHaveBeenCalledWith("Location", jasmine.any(String));
                }).then(done, done);
            });
            it("clears the login cookie when one was set", (done) => {
                routeTester.req.cookies.login = "abcd";
                routeTester[methodLower]().then(() => {
                    expect(routeTester.res.setCookie).toHaveBeenCalledWith("login", "");
                }).then(done, done);
            });
            it("does not bother with clearing the login cookie when one was not set", (done) => {
                routeTester[methodLower]().then(() => {
                    expect(routeTester.res.setCookie).not.toHaveBeenCalled();
                }).then(done, done);
            });
        });
    });
});
