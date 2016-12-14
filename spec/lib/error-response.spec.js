"use strict";

describe("ErrorResponse", () => {
    var ErrorResponse;

    beforeEach(() => {
        var promiseMock;

        promiseMock = require("../mock/promise-mock")();
        ErrorResponse = require("../../lib/error-response")(promiseMock);
    });
    it("exports known functions", () => {
        expect(Object.keys(ErrorResponse).sort()).toEqual([
            "rejectedPromiseAsync"
        ]);
    });
    describe("ErrorResponse object", () => {
        var errorObject;

        beforeEach(() => {
            errorObject = new ErrorResponse("message", "code");
        });
        it("provides its favorite MIME type", () => {
            expect(errorObject.mimeType()).toBe("application/vnd.error+json");
        });
    });
    describe("rejectedPromiseAsync", () => {
        it("returns a rejected Promise with the error", () => {
            // The majority of testing happens with the generic formatter.
            return ErrorResponse.rejectedPromiseAsync("message", "code").then(jasmine.fail, (err) => {
                expect(err.message).toBe("message");
                expect(err.code).toBe("code");
            });
        });
    });
});
