"use strict";

describe("dependencies", () => {
    var dependencies;

    beforeEach(() => {
        dependencies = require("../lib/dependencies");
    });
    it("returns an object", () => {
        expect(dependencies).toEqual(jasmine.any(Object));
    });
    it("resolves a dependency", () => {
        expect(dependencies.resolve("config")).toEqual(jasmine.any(Object));
    });
    it("resolve a dependency which has methods to run", () => {
        var webServer;

        webServer = dependencies.resolve("WebServer");
        expect(webServer).toEqual(jasmine.any(Function));
    });
});
