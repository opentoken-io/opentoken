"use strict";

var promiseMock, tokenManagerMock, validateSignatureMiddlewareMock;

jasmine.routeTester("/account/_account-id/token/_token-id/", (container) => {
    promiseMock = require("../../../../../mock/promise-mock")();
    tokenManagerMock = require("../../../../../mock/manager/token-manager-mock")();
    validateSignatureMiddlewareMock = require("../../../../../mock/middleware/validate-signature-middleware-mock")();

    container.register("tokenManager", tokenManagerMock);
    container.register("validateSignatureMiddleware", validateSignatureMiddlewareMock);
}, (routeTester) => {
    it("exports GET and a name", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name"
        ]);
    });
    describe("GET", () => {
        beforeEach(() => {
            routeTester.req.params.accountId = "accountId";
            routeTester.req.params.tokenId = "tokenId";
        });
        [
            {
                name: "with a public token and unsigned request",
                public: true,
                signed: false
            },
            {
                name: "with a public token and signed request",
                public: true,
                signed: true
            },
            {
                name: "with a private token and signed request",
                signed: true
            }
        ].forEach((scenario) => {
            describe(`successful request ${scenario.name}`, () => {
                beforeEach(() => {
                    tokenManagerMock.getRecordAsync.andCallFake(() => {
                        return promiseMock.resolve({
                            contentType: "text/plain",
                            data: new Buffer("this is the data", "binary"),
                            public: scenario.public
                        });
                    });
                    routeTester.req.signed = scenario.signed;

                    return routeTester.get();
                });
                it("sends the right status code and data", () => {
                    var args;

                    expect(routeTester.res.send).toHaveBeenCalled();
                    args = routeTester.res.send.mostRecentCall.args;
                    expect(args.length).toBe(2);
                    expect(args[0]).toBe(200);
                    expect(Buffer.isBuffer(args[1])).toBe(true);
                    expect(args[1].toString("binary")).toBe("this is the data");
                });
                it("sends the Content-Type header", () => {
                    expect(routeTester.res.header).toHaveBeenCalledWith("Content-Type", "text/plain");
                });
                it("sends the right links", () => {
                    jasmine.checkLinks([
                        {
                            href: "rendered route: account, accountId:\"accountId\"",
                            rel: "up",
                            title: "account"
                        }
                    ], routeTester.res.linkObjects);
                });
            });
        });
        [
            {
                name: "with a private record and no signature",
                record: () => {
                    return promiseMock.resolve({
                        contentType: "text/wrong",
                        data: "anything"
                    });
                },
                signed: false,
                statusCode: 403
            },
            {
                name: "with no record and signed request",
                record: () => {
                    return promiseMock.reject();
                },
                signed: true,
                statusCode: 404
            },
            {
                name: "with no record and unsigned request",
                record: () => {
                    return promiseMock.reject();
                },
                signed: false,
                statusCode: 403
            }
        ].forEach((scenario) => {
            describe(`failed request ${scenario.name}`, () => {
                beforeEach(() => {
                    routeTester.req.signed = scenario.signed;
                    tokenManagerMock.getRecordAsync.andCallFake(scenario.record);

                    return routeTester.get();
                });
                it("does not send headers", () => {
                    expect(routeTester.res.header).not.toHaveBeenCalled();
                });
                it("does not send links", () => {
                    expect(routeTester.res.links).not.toHaveBeenCalled();
                });
                it("sends the right status code", () => {
                    expect(routeTester.res.send).toHaveBeenCalledWith(scenario.statusCode);
                });
            });
        });
    });
});
