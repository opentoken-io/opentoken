"use strict";

describe("formatter/binaryFormatter", () => {
    var formatterAsync;

    beforeEach(() => {
        formatterAsync = jasmine.formatterToPromise("binaryFormatter");
    });
    it("leaves a Buffer intact", () => {
        var buff;

        buff = new Buffer("abc", "binary");

        return formatterAsync(buff).then((result) => {
            expect(result).toBe(buff);
        });
    });
    it("transforms a string into a buffer", () => {
        return formatterAsync("abc").then((result) => {
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toBe("abc");
        });
    });
    it("essentially breaks with objects", () => {
        return formatterAsync({}).then((result) => {
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary")).toBe("[object Object]");
        });
    });
});
