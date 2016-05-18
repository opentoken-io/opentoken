"use strict";

describe("dependencies", () => {
    var container;

    beforeEach(() => {
        container = require("../lib/dependencies");
    });
    it("returns an object", () => {
        expect(container).toEqual(jasmine.any(Object));
    });
    it("resolves a dependency", () => {
        expect(container.resolve("config")).toEqual(jasmine.any(Object));
    });
    it("resolve a dependency which has methods to run", () => {
        var base64;

        base64 = container.resolve("base64");
        expect(base64.decode).toEqual(jasmine.any(Function));
    });
});
