"use strict";

describe("promsie", () => {
    var promise;

    beforeEach(() => {
        function fakeBluebird(callback) {
            callback();
        }

        [
            "all",
            "any",
            "fromCallback",
            "promisify",
            "promisifyAll",
            "reject",
            "resolve"
        ].forEach((name) => {
            fakeBluebird[name] = jasmine.createSpy(name);
        });
        promise = require("../lib/promise")(fakeBluebird);
    });
    [
        "all",
        "any",
        "create",
        "fromCallback",
        "promisify",
        "promisifyAll",
        "reject",
        "resolve"
    ].forEach((name) => {
        it("exposes the " + name + " method", function () {
            expect(promise[name]).toEqual(jasmine.any(Function));
        });
    });
    it("creates a new promise", function () {
        var testedCallback;

        testedCallback = false;
        promise.create(() => {
            // I am not testing the arguments here because that's
            // code specific to Bluebird.
            testedCallback = true;
        });
        expect(testedCallback).toBe(true);
    });
});
