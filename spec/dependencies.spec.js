"use strict";

describe("dependencies", () => {
    var dependencies;

    beforeEach(() => {
        dependencies = require("../lib/dependencies");
    });

    it("resolves a dependency", () => {
        expect(dependencies).toEqual(jasmine.any(Object));
        expect(dependencies.resolve("config")).toEqual(jasmine.any(Object));
    });

    it("resolve a dependency which has methods to run", () => {
        var webServer;

        webServer = dependencies.resolve("webServer");
        expect(webServer.startServer).toEqual(jasmine.any(Function));
    });
});