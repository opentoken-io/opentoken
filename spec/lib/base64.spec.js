"use strict";

describe("base64", () => {
    var base64, binaryBufferMock;

    beforeEach(() => {
        binaryBufferMock = require("../mock/binary-buffer-mock")();
        base64 = require("../../lib/base64")(binaryBufferMock);
    });
    [
        {
            decoded: "",
            encoded: "",
            name: "empty string"
        },
        {
            decoded: "\x00",
            encoded: "AA==",
            name: "one null"
        },
        {
            decoded: "\x00\x00",
            encoded: "AAA=",
            name: "two nulls"
        },
        {
            decoded: "\x00\x00\x00",
            encoded: "AAAA",
            name: "three nulls"
        },
        {
            decoded: "\xDE\xAD\xBE\xEF",
            encoded: "3q2+7w==",
            name: "DEAD BEEF"
        }
    ].forEach((scenario) => {
        it(`encodes a buffer to a string: ${scenario.name}`, () => {
            var result;

            result = base64.encode(Buffer.from(scenario.decoded, "binary"));
            expect(result).toEqual(scenario.encoded);
        });
        it(`encodes a string to a string: ${scenario.name}`, () => {
            var result;

            result = base64.encode(scenario.decoded);
            expect(result).toEqual(scenario.encoded);
        });
        it(`decodes a buffer from a buffer: ${scenario.name}`, () => {
            var result;

            result = base64.decode(Buffer.from(scenario.encoded, "binary"));
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toEqual(scenario.decoded);
        });
        it(`decodes a buffer from a string: ${scenario.name}`, () => {
            var result;

            result = base64.decode(scenario.encoded);
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toEqual(scenario.decoded);
        });
    });
    it("encodes a buffer for use in a URI", () => {
        var result;

        result = base64.encodeForUri(Buffer.from("p5>T44d3?12Ui", "binary"));
        expect(result).toBe("cDU-VDQ0ZDM_MTJVaQ");
    });
    it("encodes a string for use in a URI", () => {
        var result;

        result = base64.encodeForUri("p5>T44d3?12Ui");
        expect(result).toBe("cDU-VDQ0ZDM_MTJVaQ");
    });
    it("decodes a string for use in a URI (perfect size)", () => {
        var buff;

        buff = base64.decodeForUri("cDU-VDQ0ZDM_MTJVaQ");
        expect(Buffer.isBuffer(buff)).toBe(true);
        expect(buff.toString("binary")).toBe("p5>T44d3?12Ui");
    });
    it("decodes a string for use in a URI (size is not a multiple of four)", () => {
        var buff;

        buff = base64.decodeForUri("eA==");
        expect(Buffer.isBuffer(buff)).toBe(true);
        expect(buff.toString("binary")).toBe("x");
    });
});
