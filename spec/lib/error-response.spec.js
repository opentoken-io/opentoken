"use strict";

describe("errorResponse", () => {
    var errorResponse, loggerMock;

    beforeEach(() => {
        var configMock, randomMock;

        configMock = {
            server: {
                exceptionIdLength: 4
            }
        };
        loggerMock = require("../mock/logger-mock")();
        randomMock = require("../mock/random-mock")();
        errorResponse = require("../../lib/error-response")(configMock, loggerMock, randomMock);
    });
    it("exports known functions", () => {
        expect(Object.keys(errorResponse).sort()).toEqual([
            "createAsync",
            "rejectedPromiseAsync"
        ]);
    });
    describe("ErrorResponse object", () => {
        var errorObject;

        beforeEach(() => {
            return errorResponse.createAsync("message", "code").then((err) => {
                errorObject = err;
            });
        });
        it("provides its favorite MIME type", () => {
            expect(errorObject.mimeType()).toBe("application/vnd.error+json");
        });
    });
    describe("createAsync", () => {
        it("creates an error without a code", () => {
            return errorResponse.createAsync("message").then((err) => {
                expect(err.message).toBe("message");
                expect(err.logref).toBe("BBBB");
            });
        });
        it("creates an error with a code", () => {
            return errorResponse.createAsync("message", "code").then((err) => {
                expect(err.message).toBe("message");
                expect(err.code).toBe("code");
                expect(err.logref).toBe("BBBB");
            });
        });
    });
    describe("rejectedPromiseAsync", () => {
        it("returns a rejected Promise with the error", () => {
            // The majority of testing happens in createAsync()
            return errorResponse.rejectedPromiseAsync("message", "code").then(jasmine.fail, (err) => {
                expect(err.message).toBe("message");
                expect(err.code).toBe("code");
                expect(err.logref).toBe("BBBB");
            });
        });
    });
});
