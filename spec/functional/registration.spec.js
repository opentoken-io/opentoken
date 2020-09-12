"use strict";

xdescribe("registration", () => {
    var test;

    beforeEach(() => {
        return jasmine.functionalTestAsync().then((result) => {
            test = result;
        });
    });
    it("returns success", () => {
        var body;

        return test.createAccountAsync().then((response) => {
            body = JSON.parse(response.body);
            expect(response.statusCode).toBe(201);
            expect(body).toEqual(jasmine.any(Object));
            expect(response.links.rel("self")[0].uri).toBe(`/account/${body.accountId}`);
        });
    });
});

