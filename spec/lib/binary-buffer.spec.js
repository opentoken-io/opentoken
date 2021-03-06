"use strict";

describe("binaryBuffer", () => {
    var binaryBuffer;

    beforeEach(() => {
        binaryBuffer = require("../../lib/binary-buffer")();
    });
    [
        "some string",
        "",
        Buffer.from("some buffer", "utf8")
    ].forEach((scenario) => {
        describe(".toBuffer()", () => {
            it("makes a buffer", () => {
                expect(binaryBuffer.toBuffer(scenario)).toEqual(jasmine.any(Buffer));
            });
            it("has the right content", () => {
                expect(binaryBuffer.toBuffer(Buffer.from(scenario, "binary"))).toEqual(jasmine.any(Buffer));
            });
        });
        describe(".toString()", () => {
            it("makes a buffer", () => {
                expect(binaryBuffer.toString(scenario)).toEqual(jasmine.any(String));
            });
            it("has the right content", () => {
                expect(binaryBuffer.toString(scenario.toString("binary"))).toEqual(jasmine.any(String));
            });
        });
    });
});
