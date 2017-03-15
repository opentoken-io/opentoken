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

            // Note: ResourceNotFoundError is technically a RestError and
            // therefore returns this error. Not sure if this is correct
            // but this is indeed what it is actually returning.
            expect(JSON.parse(response.body)).toEqual({
                code: "VNjrPetsJp"
            });
        });
    });
});
