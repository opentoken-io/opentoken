"use strict";

describe("base32", () => {
    var base32;

    beforeEach(() => {
        var thirtyTwo;

        thirtyTwo = require("thirty-two");
        base32 = require("../../lib/base32")(thirtyTwo);
    });
    [
        {
            decoded: "",
            encoded: "",
            name: "empty string"
        },
        {
            decoded: "\x00",
            encoded: "AA======",
            name: "one null"
        },
        {
            decoded: "\x00\x00",
            encoded: "AAAA====",
            name: "two nulls"
        },
        {
            decoded: "\x00\x00\x00",
            encoded: "AAAAA===",
            name: "three nulls"
        },
        {
            decoded: "\xDE\xAD\xBE\xEF",
            encoded: "32W353Y=",
            name: "DEAD BEEF"
        }
    ].forEach((scenario) => {
        it(`encodes a buffer to a string: ${scenario.name}`, () => {
            var result;

            result = base32.encode(new Buffer(scenario.decoded, "binary"));
            expect(result).toEqual(scenario.encoded);
        });
        it(`encodes a string to a string: ${scenario.name}`, () => {
            var result;

            result = base32.encode(scenario.decoded);
            expect(result).toEqual(scenario.encoded);
        });
        it(`decodes a buffer from a buffer: ${scenario.name}`, () => {
            var result;

            result = base32.decode(new Buffer(scenario.encoded, "binary"));
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toEqual(scenario.decoded);
        });
        it(`decodes a buffer from a string: ${scenario.name}`, () => {
            var result;

            result = base32.decode(scenario.encoded);
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toEqual(scenario.decoded);
        });
    });
    it("encodes a buffer for use in a URI", () => {
        var result;

        result = base32.encodeForUri(new Buffer("x", "binary"));
        expect(result).toBe("PA");
    });
    it("encodes a string for use in a URI", () => {
        var result;

        result = base32.encodeForUri("x");
        expect(result).toBe("PA");
    });
    it("decodes a string for use in a URI (perfect size)", () => {
        var buff;

        buff = base32.decodeForUri("KRSXG5BB");
        expect(Buffer.isBuffer(buff)).toBe(true);
        expect(buff.toString("binary")).toBe("Test!");
    });
    it("decodes a string for use in a URI (size is not a multiple of eight)", () => {
        var buff;

        buff = base32.decodeForUri("PA======");
        expect(Buffer.isBuffer(buff)).toBe(true);
        expect(buff.toString("binary")).toBe("x");
    });
});
