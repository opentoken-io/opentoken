"use strict";

describe("formatter/imagePngFormatter", () => {
    var formatter;

    beforeEach(() => {
        formatter = jasmine.formatter("imagePngFormatter");
    });
    it("leaves a Buffer intact", () => {
        var buff;

        buff = new Buffer("abc", "binary");
        expect(formatter(buff)).toBe(buff);
    });
    it("transforms a string into a buffer", () => {
        var result;

        result = formatter("abc");
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary")).toBe("abc");
    });
});
