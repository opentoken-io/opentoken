"use strict";

describe("util", () => {
    var util;

    beforeEach(() => {
        util = require("../../lib/util")();
    });
    describe(".clone()", () => {
        it("makes a deep copy", () => {
            var input, output;

            input = {
                a: {},
                b: "this is b"
            };
            output = util.clone(input);
            expect(input).toEqual(output);
            expect(input).not.toBe(output);
            expect(input.a).not.toBe(output.a);
        });
    });
});
