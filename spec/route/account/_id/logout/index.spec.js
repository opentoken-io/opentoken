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
            it("has no content", () => {
                return routeTester[methodLower]().then(() => {
                    expect(routeTester.res.send).toHaveBeenCalledWith(204);
                });
            });
            it("redirects", () => {
                return routeTester[methodLower]().then(() => {
                    expect(routeTester.res.header).toHaveBeenCalledWith("Location", jasmine.any(String));
                });
            });
            it("clears the login cookie when one was set", () => {
                routeTester.req.cookies.login = "abcd";

                return routeTester[methodLower]().then(() => {
                    expect(routeTester.res.setCookie).toHaveBeenCalledWith("login", "");
                });
            });
            it("does not bother with clearing the login cookie when one was not set", () => {
                return routeTester[methodLower]().then(() => {
                    expect(routeTester.res.setCookie).not.toHaveBeenCalled();
                });
            });
        });
    });
});
