"use strict";

const methods = [
    "all",
    "any",
    "fromCallback",
    "promisify",
    "promisifyAll",
    "props",
    "reject",
    "resolve",
    "try"
];

describe("promise", () => {
    var promise;

    beforeEach(() => {
        function fakeBluebird(callback) {
            callback();
        }

        methods.forEach((name) => {
            fakeBluebird[name] = jasmine.createSpy(name);
        });
        promise = require("../../lib/promise")(fakeBluebird);
    });
    methods.forEach((name) => {
        it("exposes the " + name + " method", function () {
            expect(promise[name]).toEqual(jasmine.any(Function));
        });
    });
    it("exposes the create method (not tested previously)", function () {
        expect(promise.create).toEqual(jasmine.any(Function));
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
