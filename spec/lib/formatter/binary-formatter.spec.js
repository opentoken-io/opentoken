"use strict";

describe("formatter/binaryFormatter", () => {
    var formatter;

    beforeEach(() => {
        formatter = jasmine.formatter("binaryFormatter");
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
    it("essentially breaks with objects", () => {
        try {
            formatter({});
            jasmine.fail("should have thrown an error");
        } catch (result) {
            expect(result).toEqual(jasmine.any(Error));
        }
    });
});
