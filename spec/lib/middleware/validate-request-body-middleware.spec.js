"use strict";

describe("validateRequestBodyMiddleware", () => {
    var chainMiddlewareMock, ErrorResponse, restifyMock, tv4Mock, validateRequestBodyMiddleware;

    beforeEach(() => {
        var promiseMock;

        promiseMock = require("../../mock/promise-mock")();
        ErrorResponse = require("../../../lib/error-response")(promiseMock);
        chainMiddlewareMock = jasmine.createSpy("chainMiddlewareMock");
        restifyMock = {
            plugins: jasmine.createSpyObj("restify.plugins", [
                "bodyParser"
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
        validateRequestBodyMiddleware = require("../../../lib/middleware/validate-request-body-middleware")(chainMiddlewareMock, ErrorResponse, restifyMock, tv4Mock);
    });
    it("parses the body", () => {
        validateRequestBodyMiddleware("schema");
        expect(restifyMock.plugins.bodyParser).toHaveBeenCalled();
    });
    describe("validation against schema", () => {
        var middlewareAsync, req, res;

        beforeEach(() => {
            var middleware;

            validateRequestBodyMiddleware("schema");
            middleware = chainMiddlewareMock.calls.mostRecent().args[1];
            middlewareAsync = jasmine.middlewareToPromise(middleware);
            req = require("../../mock/request-mock")();
            res = require("../../mock/response-mock")();
        });
        it("calls tv4.validateResult()", () => {
            req.body = {
                body: true
            };

            return middlewareAsync(req, res).then(() => {
                expect(tv4Mock.validateResult).toHaveBeenCalledWith({
                    body: true
                }, "schema");
                expect(res.send).not.toHaveBeenCalled();
            });
        });
        it("errors when the schema does not validateResult", () => {
            req.body = {
                body: true
            };
            tv4Mock.validateResult.and.returnValue({
                validation: "errors"
            });

            return middlewareAsync(req, res).then(jasmine.fail, () => {
                expect(tv4Mock.validateResult).toHaveBeenCalledWith({
                    body: true
                }, "schema");
                expect(res.send).toHaveBeenCalledWith(400, jasmine.any(ErrorResponse));
            });
        });
    });
});
