"use strict";

describe("formatter/jsonFormatter", () => {
    var formatter;

    beforeEach(() => {
        formatter = jasmine.formatter("jsonFormatter");
    });
    it("encodes a Buffer as base64", () => {
        var buff, result;

        buff = Buffer.from("abc", "binary");
        result = formatter(buff);
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary")).toBe("YWJj\n");
    });
    it("transforms a string into JSON", () => {
        var result;

        result = formatter("abc");
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary")).toBe("\"abc\"\n");
    });
    it("converts null", () => {
        var result;

        result = formatter(null);
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary")).toBe("null\n");
    });
    it("converts undefined", () => {
        var result;

        result = formatter();
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary")).toBe("null\n");
    });
});
