"use strict";

describe("binaryBuffer", () => {
    var binaryBuffer, copy;

    beforeEach(() => {
        binaryBuffer = require("../../lib/binary-buffer")();
    });
    [
        "some string",
        "",
        new Buffer("some buffer"),
        123
    ].forEach((scenario) => {
        describe(".toBuffer()", () => {
            it("should convert a string to a buffer", () => {
                scenario = binaryBuffer.toBuffer(scenario);
                expect(scenario).toEqual(jasmine.any(Buffer));
            });
            it("should not alter the stringOrBuffer if it is already a buffer", () => {
                copy = scenario;
                scenario = binaryBuffer.toBuffer(scenario);
                expect(scenario).toEqual(jasmine.any(Buffer));
                expect(scenario).toBe(copy);
            });
        });
        describe(".toString()", () => {
            it("should convert a buffer to a string", () => {
                scenario = binaryBuffer.toString(scenario);
                expect(scenario).toEqual(jasmine.any(String));
            });
            it("should not alter the stringOrBuffer if it is already a string", () => {
                copy = scenario;
                scenario = binaryBuffer.toString(scenario);
                expect(scenario).toEqual(jasmine.any(String));
                expect(scenario).toBe(copy);
            });
        });
    });
});
