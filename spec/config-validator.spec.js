"use strict";

describe("configValidator", () => {
    var validator;

    beforeEach(() => {
        validator = require("../lib/config-validator");
    });
    describe(".leadingTrailingSlashes()", () => {
        it("validates", () => {
            expect(validator.leadingTrailingSlashes("/login/")).toBe(true);
        });
        it("does not validate without leading slash", () => {
            expect(validator.leadingTrailingSlashes("login/")).toBe(false);
        });
        it("does not validate without trailing slash", () => {
            expect(validator.leadingTrailingSlashes("/login")).toBe(false);
        });
    });
});