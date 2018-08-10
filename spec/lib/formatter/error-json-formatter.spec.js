"use strict";

describe("formatter/errorJsonFormatter", () => {
    var formatter;

    beforeEach(() => {
        formatter = jasmine.formatter("errorJsonFormatter");
    });
    it("creates an error object", () => {
        var parsed, result;

        result = formatter("something");
        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString("binary").substr(-1)).toBe("\n");
        parsed = JSON.parse(result.toString("binary"));
        expect(parsed).toEqual({
            code: "4qsTYJa3",
            logref: "random log id",
            message: "Unknown error"
        });
    });
});
