"use strict";

var readBodyBufferMiddlewareMock, tokenManagerMock, validateSignatureMiddlewareMock;

jasmine.routeTester("/account/_account-id/token/", (container) => {
    var validateRequestQueryMiddlewareMock;

    readBodyBufferMiddlewareMock = require("../../../../mock/middleware/read-body-buffer-middleware-mock")();
    tokenManagerMock = require("../../../../mock/manager/token-manager-mock")();
    validateRequestQueryMiddlewareMock = require("../../../../mock/middleware/validate-request-query-middleware-mock")();
    validateSignatureMiddlewareMock = require("../../../../mock/middleware/validate-signature-middleware-mock")();

    container.register("readBodyBufferMiddleware", readBodyBufferMiddlewareMock);
    container.register("tokenManager", tokenManagerMock);
    container.register("validateRequestQueryMiddleware", validateRequestQueryMiddlewareMock);
    container.register("validateSignatureMiddleware", validateSignatureMiddlewareMock);
}, (routeTester) => {
    it("exports POST and a name", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "name",
            "post"
        ]);
    });
    describe("POST", () => {
        beforeEach(() => {
            routeTester.req.params.accountId = "accountId";
            routeTester.req.headers["content-type"] = "application/octet-stream";
        });
        it("does not need any query parameters", () => {
            return routeTester.post("");
        });
        it("validates 'public' against a schema", () => {
            routeTester.req.query = {
                public: "true"
            };

            return routeTester.post("");
        });
        it("disallows an invalid 'public' value", () => {
            routeTester.req.query = {
                public: "TRUE"
            };

            return routeTester.post("").then(jasmine.fail, (err) => {
                expect(err).toBe(false);
            });
        });
        it("requires a signature", () => {
            return routeTester.post("").then(() => {
                expect(validateSignatureMiddlewareMock()).toHaveBeenCalled();
            });
        });
        it("reads the body", () => {
            return routeTester.post("").then(() => {
                expect(readBodyBufferMiddlewareMock()).toHaveBeenCalled();
            });
        });
        it("creates a public token", () => {
            routeTester.req.query = {
                public: "true"
            };

            return routeTester.post("body").then(() => {
                var args;

                expect(tokenManagerMock.createAsync).toHaveBeenCalled();
                args = tokenManagerMock.createAsync.mostRecentCall.args;
                expect(args.length).toBe(3);
                expect(args[0]).toBe("accountId");
                expect(Buffer.isBuffer(args[1])).toBe(true);
                expect(args[1].toString("binary")).toBe("body");
                expect(args[2]).toEqual({
                    contentType: "application/octet-stream",
                    public: true
                });
            });
        });
        it("creates a private token", () => {
            return routeTester.post("body").then(() => {
                var args;

                expect(tokenManagerMock.createAsync).toHaveBeenCalled();
                args = tokenManagerMock.createAsync.mostRecentCall.args;
                expect(args.length).toBe(3);
                expect(args[0]).toBe("accountId");
                expect(Buffer.isBuffer(args[1])).toBe(true);
                expect(args[1].toString("binary")).toBe("body");
                expect(args[2]).toEqual({
                    contentType: "application/octet-stream",
                    public: false
                });
            });
        });
        describe("successful response", () => {
            beforeEach(() => {
                return routeTester.post("body");
            });
            it("sets the Location header", () => {
                expect(routeTester.res.header).toHaveBeenCalledWith("Location", "rendered route: account-token, accountId:\"accountId\", tokenId:\"tokenId\"");
            });
            it("set the right links", () => {
                jasmine.checkLinks([
                    {
                        href: "rendered route: account-token, accountId:\"accountId\", tokenId:\"tokenId\"",
                        rel: "self"
                    },
                    {
                        href: "rendered route: account, accountId:\"accountId\"",
                        rel: "up",
                        title: "account"
                    }
                ], routeTester.res.linkObjects);
            });
            it("resulted in a 201 (very important)", () => {
                expect(routeTester.res.send).toHaveBeenCalledWith(201);
            });
        });
    });
});
