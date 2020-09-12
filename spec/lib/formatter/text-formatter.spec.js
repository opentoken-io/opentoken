"use strict";

describe("formatter/textFormatter", () => {
    var formatter;

    beforeEach(() => {
        formatter = jasmine.formatter("textFormatter");
    });
    it("encodes a Buffer as a string", () => {
        var buff, result;

        buff = Buffer.from("abc", "binary");
        result = formatter(buff);
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary")).toBe("abc\n");
    });
    it("transforms a string into a Buffer", () => {
        var result;

        result = formatter("abc");
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary")).toBe("abc\n");
    });
    it("converts null", () => {
        var result;

        result = formatter(null);
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary")).toBe("\n");
    });
    it("converts some object in a terrible way", () => {
        var result;

        result = formatter({});
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary")).toBe("[object Object]\n");
    });
});
