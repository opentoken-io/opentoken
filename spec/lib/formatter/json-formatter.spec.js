"use strict";

describe("formatter/jsonFormatter", () => {
    var formatterAsync;

    beforeEach(() => {
        formatterAsync = jasmine.formatterToPromise("jsonFormatter");
    });
    it("encodes a Buffer as base64", () => {
        var buff;

        buff = new Buffer("abc", "binary");

        return formatterAsync(buff).then((result) => {
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toBe("YWJj\n");
        });
    });
    it("transforms a string into JSON", () => {
        return formatterAsync("abc").then((result) => {
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toBe("\"abc\"\n");
        });
    });
    it("converts null", () => {
        return formatterAsync(null).then((result) => {
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toBe("null\n");
        });
    });
    it("converts undefined", () => {
        return formatterAsync().then((result) => {
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toBe("null\n");
        });
    });
});
