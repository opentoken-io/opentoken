"use strict";

describe("validateRequestMiddleware", () => {
    var chainMiddlewareMock, restifyPluginsMock, schemaMock, validateRequestMiddleware;

    beforeEach(() => {
        chainMiddlewareMock = jasmine.createSpy("chainMiddlewareMock");
        restifyPluginsMock = jasmine.createSpyObj("restifyPlugins", [
            "bodyParser"
        ]);
        schemaMock = jasmine.createSpyObj("schema", [
            "validate"
        ]);
        schemaMock.validate.andReturn(null);
        validateRequestMiddleware = require("../../lib/validate-request-middleware")(chainMiddlewareMock, restifyPluginsMock, schemaMock);
    });
    it("parses the body", () => {
        validateRequestMiddleware("schema");
        expect(restifyPluginsMock.bodyParser).toHaveBeenCalled();
    });
    describe("validation against schema", () => {
        var middleware, req, res;

        beforeEach(() => {
            validateRequestMiddleware("schema");
            middleware = chainMiddlewareMock.mostRecentCall.args[1];
            req = require("../mock/request-mock")();
            res = require("../mock/response-mock")();
        });
        it("calls schema.validate()", (done) => {
            req.body = {
                body: true
            };
            middleware(req, res, (result) => {
                expect(schemaMock.validate).toHaveBeenCalledWith({
                    body: true
                }, "schema");
                expect(typeof result).toBe("undefined");
                expect(res.send).not.toHaveBeenCalled();
                done();
            });
        });
        it("errors when the schema does not validate", (done) => {
            req.body = {
                body: true
            };
            schemaMock.validate.andReturn({
                validation: "errors"
            });
            middleware(req, res, (result) => {
                expect(schemaMock.validate).toHaveBeenCalledWith({
                    body: true
                }, "schema");
                expect(result).toBe(false);
                expect(res.send).toHaveBeenCalledWith(400, jasmine.any(Error));
                done();
            });
        });
    });
});
