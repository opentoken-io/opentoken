"use strict";

describe("base64", () => {
    var base64;

    beforeEach(() => {
        base64 = require("../lib/base64");
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
        it("string encodes " + scenario.name, () => {
            var result;

            result = base64.encode(scenario.decoded);
            expect(result).toEqual(scenario.encoded);
        });
        it("buffer encodes " + scenario.name, () => {
            var result;

            result = base64.encode(new Buffer(scenario.decoded, "binary"));
            expect(result).toEqual(jasmine.any(Buffer));
            expect(result.toString("binary")).toEqual(scenario.encoded);
        });
        it("string decodes " + scenario.name, () => {
            var result;

            result = base64.decode(scenario.encoded);
            expect(result).toEqual(scenario.decoded);
        });
        it("buffer decodes " + scenario.name, () => {
            var result;

            result = base64.decode(new Buffer(scenario.encoded, "binary"));
            expect(result).toEqual(jasmine.any(Buffer));
            expect(result.toString("binary")).toEqual(scenario.decoded);
        });
    });
    it("data encodes for URI", () => {
        var result;

        result = base64.encodeForUri(new Buffer("p5>T44d3?12Ui", "binary"));
        expect(result).toEqual(jasmine.any(Buffer));
        expect(result.toString()).toBe("cDU-VDQ0ZDM_MTJVaQ");
    });
});
