"use strict";

jasmine.routeTester("/health-check/", null, (routeTester) => {
    it("exports GET and a name", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name"
        ]);
    });
    describe("GET", () => {
        it("says all is well", () => {
            return routeTester.get().then(() => {
                expect(routeTester.res.send).toHaveBeenCalledWith(200, {
                    status: "healthy"
                });
            });
        });
    });
});
