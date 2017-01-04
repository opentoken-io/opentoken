"use strict";

describe("404 errors", () => {
    var test;

    beforeEach(() => {
        return jasmine.functionalTestAsync().then((result) => {
            test = result;
        });
    });
    it("returns no content", () => {
        return test.requestAsync({
            url: "/something-wicked-this-way-comes"
        }).then((response) => {
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({
                code: "ResourceNotFound",
                message: "/something-wicked-this-way-comes does not exist"
            });
        });
    });
});

