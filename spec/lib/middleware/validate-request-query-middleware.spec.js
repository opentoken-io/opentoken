"use strict";

describe("validateRequestQueryMiddleware", () => {
    var chainMiddlewareMock, middlewareFactory, restifyPluginsMock, schemaMock;

    beforeEach(() => {
        chainMiddlewareMock = jasmine.createSpy("chainMiddlewareMock");
        restifyPluginsMock = jasmine.createSpyObj("restifyPlugins", [
            "queryParser"
        ]);
        schemaMock = jasmine.createSpyObj("schema", [
            "validate"
        ]);
        schemaMock.validate.andReturn(null);
        middlewareFactory = require("../../../lib/middleware/validate-request-query-middleware")(chainMiddlewareMock, restifyPluginsMock, schemaMock);
    });
    it("parses the query", () => {
        middlewareFactory("schema");
        expect(restifyPluginsMock.queryParser).toHaveBeenCalled();
    });
    describe("validation against schema", () => {
        var middleware, req, res;

        beforeEach(() => {
            middlewareFactory("schema");
            middleware = chainMiddlewareMock.mostRecentCall.args[1];
            req = require("../../mock/request-mock")();
            res = require("../../mock/response-mock")();
        });
        it("calls schema.validate()", (done) => {
            req.query = {
                query: true
            };
            middleware(req, res, (result) => {
                expect(schemaMock.validate).toHaveBeenCalledWith({
                    query: true
                }, "schema");
                expect(typeof result).toBe("undefined");
                expect(res.send).not.toHaveBeenCalled();
                done();
            });
        });
        it("errors when the schema does not validate", (done) => {
            req.query = {
                query: true
            };
            schemaMock.validate.andReturn({
                validation: "errors"
            });
            middleware(req, res, (result) => {
                expect(schemaMock.validate).toHaveBeenCalledWith({
                    query: true
                }, "schema");
                expect(result).toBe(false);
                expect(res.send).toHaveBeenCalledWith(400, jasmine.any(Error));
                done();
            });
        });
    });
});
