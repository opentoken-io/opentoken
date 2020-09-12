"use strict";

describe("validateRequestQueryMiddleware", () => {
    var chainMiddlewareMock, ErrorResponse, middlewareFactory, restifyMock, tv4Mock;

    beforeEach(() => {
        var promiseMock;

        promiseMock = require("../../mock/promise-mock")();
        ErrorResponse = require("../../../lib/error-response")(promiseMock);
        chainMiddlewareMock = jasmine.createSpy("chainMiddlewareMock");
        restifyMock = {
            plugins: jasmine.createSpyObj("restify.plugins", [
                "queryParser"
            ])
        };
        tv4Mock = jasmine.createSpyObj("tv4", [
            "validateResult"
        ]);
        tv4Mock.validateResult.and.returnValue({
            error: null,
            missing: [],
            valid: "true"
        });
        middlewareFactory = require("../../../lib/middleware/validate-request-query-middleware")(chainMiddlewareMock, ErrorResponse, restifyMock, tv4Mock);
    });
    it("parses the query", () => {
        middlewareFactory("schema");
        expect(restifyMock.plugins.queryParser).toHaveBeenCalled();
    });
    describe("validation against schema", () => {
        var middlewareAsync, req, res;

        beforeEach(() => {
            var middleware;

            middlewareFactory("schema");
            middleware = chainMiddlewareMock.calls.mostRecent().args[1];
            middlewareAsync = jasmine.middlewareToPromise(middleware);
            req = require("../../mock/request-mock")();
            res = require("../../mock/response-mock")();
        });
        it("calls tv4.validateResult()", () => {
            req.query = {
                query: true
            };

            return middlewareAsync(req, res).then(() => {
                expect(tv4Mock.validateResult).toHaveBeenCalledWith({
                    query: true
                }, "schema");
                expect(res.send).not.toHaveBeenCalled();
            });
        });
        it("errors when the schema does not validate", () => {
            req.query = {
                query: true
            };
            tv4Mock.validateResult.and.returnValue({
                validation: "errors"
            });

            return middlewareAsync(req, res).then(jasmine.fail, () => {
                expect(tv4Mock.validateResult).toHaveBeenCalledWith({
                    query: true
                }, "schema");
                expect(res.send).toHaveBeenCalledWith(400, jasmine.any(ErrorResponse));
            });
        });
    });
});
