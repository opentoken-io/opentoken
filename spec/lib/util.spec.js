"use strict";

describe("util", () => {
    var util;

    beforeEach(() => {
        util = require("../../lib/util")();
    });
    describe(".arrayRequireItems()", () => {
        it("returns an empty array when the arrays match", () => {
            expect(util.arrayRequireItems([
                "a",
                "b"
            ], [
                "a",
                "b"
            ])).toEqual([]);
        });
        it("does not error on empty arrays being passed in", () => {
            expect(util.arrayRequireItems([], [])).toEqual([]);
        });
        it("returns an empty array when there's more in the haystack", () => {
            expect(util.arrayRequireItems([
                "a",
                "b",
                "c",
                "d"
            ], [
                "a",
                "b"
            ])).toEqual([]);
        });
        it("returns missing items when they are not in the haystack", () => {
            expect(util.arrayRequireItems([
                "a",
                "b"
            ], [
                "a",
                "b",
                "c",
                "d"
            ])).toEqual([
                "c",
                "d"
            ]);
        });
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
    describe(".deepMerge()", () => {
        it("prefers the override", () => {
            expect(util.deepMerge("a", "b")).toBe("b");
        });
        it("uses the default when the override is undefined", () => {
            expect(util.deepMerge("a")).toBe("a");
        });
        it("does not merge when the default is not an object", () => {
            expect(util.deepMerge("asdf", {
                obj: true
            })).toEqual({
                obj: true
            });
        });
        it("does not error when the override is not an object", () => {
            expect(util.deepMerge({
                obj: true
            }, "asdf")).toEqual("asdf");
        });
        it("actually merges objects", () => {
            expect(util.deepMerge({
                both: "WRONG",
                default: "correct"
            }, {
                both: "correct",
                override: "correct"
            })).toEqual({
                both: "correct",
                default: "correct",
                override: "correct"
            });
        });
    });
});
