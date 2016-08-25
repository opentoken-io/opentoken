"use strict";

describe("formatter/genericFormatter", () => {
    var defaultTransform, genericFormatterAsync, resMock;


    /**
     * These tests all basically do the same thing.  This function
     * abstracts away those tests.
     *
     * @param {*} input
     * @param {Object} expected Desired results after parsing JSON
     * @param {number} length Length of buffer
     */
    function standardErrorChecks(input, expected, length) {
        it("returns a buffer", () => {
            return genericFormatterAsync(input).then((result) => {
                expect(Buffer.isBuffer(result)).toBe(true);
            });
        });
        it("has a trailing newline", () => {
            return genericFormatterAsync(input).then((result) => {
                expect(result.toString("binary").substr(-1)).toBe("\n");
            });
        });
        it("is valid JSON and is what we expect", () => {
            return genericFormatterAsync(input).then((result) => {
                var parsed;

                parsed = JSON.parse(result.toString("binary"));
                expect(parsed).toEqual(expected);
            });
        });
        it("sets the right Content-Length header", () => {
            return genericFormatterAsync(input).then(() => {
                expect(resMock.setHeader).toHaveBeenCalledWith("Content-Length", length);
            });
        });
    }

    beforeEach(() => {
        var errorResponseMock, genericFormatter, reqMock;

        errorResponseMock = require("../../mock/error-response-mock")();
        genericFormatter = require("../../../lib/formatter/generic-formatter")(errorResponseMock);
        reqMock = require("../../mock/request-mock")();
        resMock = require("../../mock/response-mock")();
        defaultTransform = (req, res, body, done) => {
            done(null, new Buffer("{\"DEFAULT TRANSFORM\":true}\n", "binary"));
        };
        genericFormatterAsync = (body) => {
            return new Promise((resolve, reject) => {
                var formatter;

                formatter = genericFormatter.formatWithFallback(defaultTransform);
                formatter(reqMock, resMock, body, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        };
    });
    describe("Error objects", () => {
        standardErrorChecks(new Error("test"), {
            code: "OVMGEN1j",
            message: "Error: test"
        }, 44);
    });
    describe("ErrorResponse objects without a code", () => {
        standardErrorChecks({
            extra: "ignore this",
            logref: "this is a logref",
            message: "some message"
        }, {
            logref: "this is a logref",
            message: "some message"
        }, 55);
    });
    describe("ErrorResponse objects with a code", () => {
        standardErrorChecks({
            code: "abcd",
            extra: "ignore this",
            logref: "this is a logref",
            message: "some message"
        }, {
            code: "abcd",
            logref: "this is a logref",
            message: "some message"
        }, 69);
    });
    describe("default transform works", () => {
        standardErrorChecks("test", {
            "DEFAULT TRANSFORM": true
        }, 27);
    });
    describe("default transform errors", () => {
        beforeEach(() => {
            defaultTransform = (req, res, body, done) => {
                done(new Error("whoops"));
            };
        });
        it("propogates the error out of the formatter", () => {
            return genericFormatterAsync("abcd").then(jasmine.fail, (err) => {
                expect(err instanceof Error).toBe(true);
                expect(err.toString()).toBe("Error: whoops");
            });
        });
    });
});
