"use strict";

xdescribe("self-discovery", () => {
    var test;

    beforeEach(() => {
        return jasmine.functionalTestAsync().then((result) => {
            test = result;
        });
    });
    it("returns no content", () => {
        return test.startAsync().then((response) => {
            expect(response.body).toBe("");
            expect(response.statusCode).toBe(204);
        });
    });
});

