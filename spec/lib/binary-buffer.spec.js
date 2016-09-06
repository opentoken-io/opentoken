"use strict";

describe("binaryBuffer", () => {
    var binaryBuffer;

    beforeEach(() => {
        binaryBuffer = require("../../lib/binary-buffer")();
    });
    [
        "some string",
        "",
        new Buffer("some buffer")
    ].forEach((scenario) => {
        describe(".toBuffer()", () => {
            it("converts a string to a buffer", () => {
                expect(binaryBuffer.toBuffer(scenario)).toEqual(jasmine.any(Buffer));
            });
            it("preserves the input when it is already a buffer", () => {
                expect(binaryBuffer.toBuffer(new Buffer(scenario, "binary"))).toEqual(jasmine.any(Buffer));
            });
        });
        describe(".toString()", () => {
            it("converts a buffer to a string", () => {
                expect(binaryBuffer.toString(scenario)).toEqual(jasmine.any(String));
            });
            it("preserves the input if it is already a string", () => {
                expect(binaryBuffer.toString(scenario.toString("binary"))).toEqual(jasmine.any(String));
            });
        });
    });
});
