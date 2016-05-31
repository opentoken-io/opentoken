"use strict";

describe("route: /", () => {
    var factory;

    beforeEach(() => {
        factory = require("../../route/");
    });
    it("exports a factory", () => {
        expect(factory).toEqual(jasmine.any(Function));
    });
    describe("factory results", () => {
        var req, res, route;

        beforeEach(() => {
            route = factory();
            req = require("../mock/request-mock")();
            res = require("../mock/response-mock")();
        });
        it("has only a GET method", () => {
            expect(Object.keys(route)).toEqual([
                "get"
            ]);
        });
        describe("GET", () => {
            it("does testing-only actions", (done) => {
                route.get(req, res, () => {
                    expect(res.contentType).toBe("text/plain");
                    expect(res.send).toHaveBeenCalled();
                    done();
                });
            });
        });
    });
});
