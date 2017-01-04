"use strict";

describe("registration", () => {
    var test;

    beforeEach(() => {
        return jasmine.functionalTestAsync().then((result) => {
            test = result;
        });
    });
    it("returns success", () => {
        return test.createAccountAsync().then((response) => {
            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual(jasmine.any(Object));
            expect(response.links.self.url).toBe(`/account/${response.body.accountId}`);
        });
    });
});

