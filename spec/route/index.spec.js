"use strict";

describe("route: /", () => {
    var factory;

    beforeEach(() => {
        factory = require("../../route/");
    });
    it("exports a factory", () => {
        expect(factory).toEqual(jasmine.any(Function));
    });
    describe("factory results (/)", () => {
        var req, res, route, serverMock;

        beforeEach(() => {
            var container;

            container = require("../../lib/dependencies.js");
            container.register("config", {
                baseDir: "/"
            });
            serverMock = require("../mock/server-mock")();
            route = factory(serverMock, "/", {
                container
            });
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
            it("calls server.get for static assets", (done) => {
                route.get(req, res, () => {
                    expect(serverMock.get).toHaveBeenCalledWith(jasmine.any(RegExp), jasmine.any(Function));
                    done();
                });
            });
        });
    });
    describe("factory results (/index)", () => {
        var req, res, route, serverMock;

        beforeEach(() => {
            var container;

            container = require("../../lib/dependencies.js");
            container.register("config", {
                baseDir: "/"
            });
            serverMock = require("../mock/server-mock")();
            route = factory(serverMock, "/index", {
                container
            });
            req = require("../mock/request-mock")();
            res = require("../mock/response-mock")();
        });
        it("never called server.get()", (done) => {
            route.get(req, res, () => {
                expect(serverMock.get).not.toHaveBeenCalled();
                done();
            });
        });
    });
});
