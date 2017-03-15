"use strict";

describe("health-check", () => {
    var test;

    beforeEach(() => {
        return jasmine.functionalTestAsync().then((result) => {
            test = result;
        });
    });
    it("returns success", () => {
        return test.startAsync("service", "health-check").then((response) => {
            expect(JSON.parse(response.body)).toEqual({
                status: "healthy"
            });
            expect(response.statusCode).toBe(200);
        });
    });
});

