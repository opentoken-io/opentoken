"use strict";

describe("validateRequestQueryMiddleware", () => {
    var chainMiddlewareMock, ErrorResponse, middlewareFactory, restifyPluginsMock, schemaMock;

    beforeEach(() => {
        var promiseMock;

        promiseMock = require("../../mock/promise-mock")();
        ErrorResponse = require("../../../lib/error-response")(promiseMock);
        chainMiddlewareMock = jasmine.createSpy("chainMiddlewareMock");
        restifyPluginsMock = jasmine.createSpyObj("restifyPlugins", [
            "queryParser"
        ]);
        schemaMock = jasmine.createSpyObj("schema", [
            "validate"
        ]);
        schemaMock.validate.andReturn(null);
        middlewareFactory = require("../../../lib/middleware/validate-request-query-middleware")(chainMiddlewareMock, ErrorResponse, restifyPluginsMock, schemaMock);
    });
    it("parses the query", () => {
        middlewareFactory("schema");
        expect(restifyPluginsMock.queryParser).toHaveBeenCalled();
    });
    describe("validation against schema", () => {
        var middlewareAsync, req, res;

        beforeEach(() => {
            var middleware;

            middlewareFactory("schema");
            middleware = chainMiddlewareMock.mostRecentCall.args[1];
            middlewareAsync = jasmine.middlewareToPromise(middleware);
            req = require("../../mock/request-mock")();
            res = require("../../mock/response-mock")();
        });
        it("calls schema.validate()", () => {
            req.query = {
                query: true
            };

            return middlewareAsync(req, res).then(() => {
                expect(schemaMock.validate).toHaveBeenCalledWith({
                    query: true
                }, "schema");
                expect(res.send).not.toHaveBeenCalled();
            });
        });
        it("errors when the schema does not validate", () => {
            req.query = {
                query: true
            };
            schemaMock.validate.andReturn({
                validation: "errors"
            });

            return middlewareAsync(req, res).then(jasmine.fail, () => {
                expect(schemaMock.validate).toHaveBeenCalledWith({
                    query: true
                }, "schema");
                expect(res.send).toHaveBeenCalledWith(400, jasmine.any(ErrorResponse));
            });
        });
    });
});
