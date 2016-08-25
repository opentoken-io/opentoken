"use strict";

describe("formatters", () => {
    var formatters;

    beforeEach(() => {
        formatters = require("../../lib/formatters")("binaryFormatter", "errorJsonFormatter", "imagePngFormatter", "jsonFormatter", "jsonpFormatter", "textFormatter");
    });
    describe("the returned object", () => {
        it("simply is a collection of other formatters", () => {
            expect(formatters).toEqual({
                "application/javascript; q=0.2": "jsonpFormatter",
                "application/json; q=0.5": "jsonFormatter",
                "application/octet-stream; q=0.3": "binaryFormatter",
                "application/vnd.error+json; q=0.1": "errorJsonFormatter",
                "image/png; q=0.1": "imagePngFormatter",
                "text/plain; q=0.4": "textFormatter"
            });
        });
    });
});
