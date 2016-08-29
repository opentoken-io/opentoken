"use strict";

describe("formatter/errorJsonFormatter", () => {
    var formatterAsync;

    beforeEach(() => {
        formatterAsync = jasmine.formatterToPromise("errorJsonFormatter");
    });
    it("creates an error object", () => {
        return formatterAsync("something").then((result) => {
            var parsed;

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString("binary").substr(-1)).toBe("\n");
            parsed = JSON.parse(result.toString("binary"));
            expect(parsed).toEqual({
                code: "4qsTYJa3",
                logRef: "fakeLogRef",
                message: "Unknown error"
            });
        });
    });
});
