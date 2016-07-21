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
        it("clones null", () => {
            expect(util.clone(null)).toBe(null);
        });
        it("clones a string", () => {
            expect(util.clone("a string")).toBe("a string");
        });
        it("converts string objects into strings", () => {
            /* eslint no-new-wrappers:"off" */
            expect(util.clone(new String("xx"))).toBe("xx");
        });
    });
});
