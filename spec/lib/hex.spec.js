"use strict";

describe("hex", () => {
    var hex;

    beforeEach(() => {
        hex = require("../../lib/hex")();
    });
    [
        {
            decoded: "",
            encoded: "",
            name: "empty string"
        },
        {
            decoded: "\x00",
            encoded: "00",
            name: "one null"
        },
        {
            // Must be lowercase!
            decoded: "hello",
            encoded: "68656c6c6f",
            name: "hello"
        },
        {
            // Must encode as lowercase!
            decoded: "\xDE\xAD\xBE\xEF",
            encoded: "deadbeef",
            name: "DEAD BEEF"
        }
    ].forEach((scenario) => {
        it(`encodes a buffer to a string: ${scenario.name}`, () => {
            var result;

            result = hex.encode(new Buffer(scenario.decoded, "binary"));
            expect(result).toEqual(scenario.encoded);
        });
        it(`encodes a string to a string: ${scenario.name}`, () => {
            var result;

            result = hex.encode(scenario.decoded);
            expect(result).toEqual(scenario.encoded);
        });
        it(`decodes a buffer from a string: ${scenario.name}`, () => {
            var result;

            result = hex.decode(scenario.encoded);
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toEqual(scenario.decoded);
        });
        it(`decodes a buffer from a buffer: ${scenario.name}`, () => {
            var result;

            result = hex.decode(new Buffer(scenario.encoded, "binary"));
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toEqual(scenario.decoded);
        });
    });
    it("removes non-hex characters before decoding", () => {
        var result;

        result = hex.decode("testing character removal");
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary")).toEqual("\xec\xaa\xce\xea");
    });
    it("decodes uppercase", () => {
        var result;

        result = hex.decode("4C");
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary")).toEqual("L");
    });
});
