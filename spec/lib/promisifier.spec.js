"use strict";

describe("promisifier", () => {
    var promiseMock, promisifier;

    beforeEach(() => {
        promiseMock = require("../mock/promise-mock")();
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
        promiseMock.promisifyAll.and.returnValue(result);
        expect(promisifier(obj)).toBe(result);
        expect(promiseMock.promisifyAll).toHaveBeenCalledWith(obj);
    });
    it("promisifies a function as well", () => {
        var fn, result;

        fn = () => {};
        result = () => {};
        promiseMock.promisify.and.returnValue(result);
        promiseMock.promisifyAll.and.callFake((x) => {
            return x;
        });
        expect(promisifier(fn)).toBe(result);
        expect(promiseMock.promisify).toHaveBeenCalledWith(fn);
        expect(promiseMock.promisifyAll).toHaveBeenCalledWith(result);
    });
});
