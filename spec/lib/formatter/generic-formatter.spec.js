"use strict";

describe("formatter/genericFormatter", () => {
    var defaultTransform, ErrorResponse, formatter, resMock;


    /**
     * Fake RestError object
     */
    class RestError extends Error {
        /**
         * Extends Error
         */
        constructor() {
            super();
            this.displayName = "RestError";
        }
    }


    /**
     * Fake RestError object
     */
    class HttpError extends Error {
        /**
         * Extends Error
         */
        constructor() {
            super();
            this.displayName = "HttpError";
        }
    }


    /**
     * These tests all basically do the same thing.  This function
     * abstracts away those tests.
     *
     * @param {Function} inputFn Generates the input value
     * @param {Object} expected Desired results after parsing JSON
     * @param {number} length Length of buffer
     */
    function standardErrorChecks(inputFn, expected, length) {
        var input, result;

        beforeEach(() => {
            input = inputFn();
            result = formatter(input);
        });
        it("returns a buffer", () => {
            expect(Buffer.isBuffer(result)).toBe(true);
        });
        it("has a trailing newline", () => {
            expect(result.toString("binary").substr(-1)).toBe("\n");
        });
        it("is valid JSON and is what we expect", () => {
            var parsed;

            parsed = JSON.parse(result.toString("binary"));
            expect(parsed).toEqual(expected);
        });
        it("sets the right Content-Length header", () => {
            expect(resMock.setHeader).toHaveBeenCalledWith("Content-Length", length);
        });
    }

    beforeEach(() => {
        var genericFormatter, promiseMock, reqMock, restifyErrorsMock;

        restifyErrorsMock = {
            HttpError,
            RestError
        };
        promiseMock = require("../../mock/promise-mock")();
        ErrorResponse = require("../../../lib/error-response")(promiseMock);
        genericFormatter = require("../../../lib/formatter/generic-formatter")(ErrorResponse, restifyErrorsMock);
        reqMock = require("../../mock/request-mock")();
        resMock = require("../../mock/response-mock")();
        defaultTransform = () => {
            return new Buffer("{\"DEFAULT TRANSFORM\":true}\n", "binary");
        };
        formatter = (body) => {
            var formatterFn;

            formatterFn = genericFormatter.formatWithFallback(defaultTransform);

            return formatterFn(reqMock, resMock, body);
        };
    });
    describe("Error objects", () => {
        standardErrorChecks(() => {
            return new Error("test");
        }, {
            code: "OVMGEN1j",
            logref: "random log id",
            message: "Error: test"
        }, 69);
    });
    describe("HttpError objects", () => {
        standardErrorChecks(() => {
            return new HttpError();
        }, {
            code: "vAVAZv890x",
            logref: "random log id",
            message: "HttpError"
        }, 69);
    });
    describe("RestError objects", () => {
        standardErrorChecks(() => {
            return new RestError();
        }, {
            code: "VNjrPetsJp",
            logref: "random log id",
            message: "RestError"
        }, 69);
    });
    describe("ErrorResponse objects without a code", () => {
        standardErrorChecks(() => {
            return new ErrorResponse("some message");
        }, {
            code: "zbrQmkdHi6",
            logref: "random log id",
            message: "some message"
        }, 72);
    });
    describe("ErrorResponse objects with a code", () => {
        standardErrorChecks(() => {
            return new ErrorResponse("some message", "abcd");
        }, {
            code: "abcd",
            logref: "random log id",
            message: "some message"
        }, 66);
    });
    describe("default transform works", () => {
        standardErrorChecks(() => {
            return "test";
        }, {
            "DEFAULT TRANSFORM": true
        }, 27);
    });
    describe("default transform errors", () => {
        beforeEach(() => {
            defaultTransform = () => {
                return new Error("whoops");
            };
        });
        it("propogates the error out of the formatter", () => {
            var result;

            result = formatter("abcd");
            expect(result instanceof Error).toBe(true);
            expect(result.toString()).toBe("Error: whoops");
        });
    });
});
