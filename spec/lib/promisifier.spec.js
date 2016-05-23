"use strict";

describe("promisifier", () => {
    var promiseMock, promisifier;

    beforeEach(() => {
        promiseMock = require("../mock/promise-mock");
        promisifier = require("../../lib/promisifier")(promiseMock);
    });
    it("is a function", () => {
        expect(promisifier).toEqual(jasmine.any(Function));
    });
    it("promisifies something that is passed in", () => {
        var obj, result;

        obj = {
            thing: "object to promisify"
        };
        result = {
            description: "result from promise.promisifyAll()"
        };
        spyOn(promiseMock, "promisifyAll").andReturn(result);
        expect(promisifier(obj)).toBe(result);
        expect(promiseMock.promisifyAll).toHaveBeenCalledWith(obj);
    });
});
