"use strict";

describe("formatter/textFormatter", () => {
    var formatterAsync;

    beforeEach(() => {
        formatterAsync = jasmine.formatterToPromise("textFormatter");
    });
    it("encodes a Buffer as a string", () => {
        var buff;

        buff = new Buffer("abc", "binary");

        return formatterAsync(buff).then((result) => {
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toBe("abc\n");
        });
    });
    it("transforms a string into a Buffer", () => {
        return formatterAsync("abc").then((result) => {
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toBe("abc\n");
        });
    });
    it("converts null", () => {
        return formatterAsync(null).then((result) => {
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toBe("\n");
        });
    });
    it("converts some object in a terrible way", () => {
        return formatterAsync({}).then((result) => {
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toBe("[object Object]\n");
        });
    });
});
