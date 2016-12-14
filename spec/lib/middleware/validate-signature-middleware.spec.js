"use strict";

describe("middleware/validateSignatureMiddleware", () => {
    var authorizedHeader, ErrorResponse, middlewareFactory, OtDateMock, signatureOt1Mock;

    beforeEach(() => {
        var configMock, promiseMock;

        // Minimal authorized header.  This would normally be
        // rejected by the version-specific signature verification.
        authorizedHeader = "OT1-HMAC-SHA256-HEX";

        configMock = {
            signature: {
                dateWindowFuture: {
                    minutes: 1
                },
                dateWindowPast: {
                    minutes: 5
                },
                host: "example.com",
                method: "OT1-HMAC-SHA256-HEX",
                relatedLink: "https://example.com/signature-description"
            }
        };
        OtDateMock = require("../../mock/ot-date-mock")();
        promiseMock = require("../../mock/promise-mock")();
        ErrorResponse = require("../../../lib/error-response")(promiseMock);
        signatureOt1Mock = require("../../mock/signature-ot1-mock")();

        // Always return the same date for the date checks.
        // We can simulate errors in other ways, shown in tests below.
        OtDateMock.now.andReturn(OtDateMock.now());

        middlewareFactory = require("../../../lib/middleware/validate-signature-middleware")(configMock, ErrorResponse, OtDateMock, promiseMock, signatureOt1Mock);
    });
    it("resulted in a middleware factory", () => {
        expect(middlewareFactory).toEqual(jasmine.any(Function));
    });
    it("can create middleware", () => {
        expect(middlewareFactory()).toEqual(jasmine.any(Function));
    });
    describe("middleware", () => {
        var allowUnsigned, reqMock, resMock, runMiddlewareAsync;

        /**
         * Returns a function that will be used to confirm the rejected
         * promise is what we expect.
         *
         * @param {string} message
         * @param {string} code
         * @return {Function}
         */
        function assertError(message, code) {
            return () => {
                expect(resMock.header).toHaveBeenCalledWith("WWW-Authenticate", "OT1-HMAC-SHA256-HEX");
                jasmine.checkLinks([
                    {
                        href: "https://example.com/signature-description",
                        rel: "related",
                        title: "signature-information"
                    }
                ], resMock.linkObjects);
                expect(resMock.send).toHaveBeenCalledWith(401, jasmine.any(ErrorResponse));
                expect(resMock.send.mostRecentCall.args[1].code).toBe(code);
                expect(resMock.send.mostRecentCall.args[1].message).toBe(message);
            };
        }

        beforeEach(() => {
            reqMock = require("../../mock/request-mock")();
            resMock = require("../../mock/response-mock")();

            // Set reasonable defaults on the request
            reqMock.headers.host = "example.com";
            reqMock.headers["x-opentoken-date"] = OtDateMock.now().toString();
            allowUnsigned = false;

            runMiddlewareAsync = (signature) => {
                var middleware, middlewareAsync;

                middleware = middlewareFactory(allowUnsigned);
                middlewareAsync = jasmine.middlewareToPromise(middleware);

                if (signature) {
                    reqMock.headers.authorization = signature;
                }

                return middlewareAsync(reqMock, resMock);
            };
        });
        describe("allowUnsigned=true", () => {
            // Most of the tests are elsewhere.  This only tests the
            // behavior that changes when allowUnsigned=true.
            beforeEach(() => {
                allowUnsigned = true;
            });
            it("allows an unsigned request", () => {
                return runMiddlewareAsync().then(() => {
                    expect(reqMock.signed).toBe(false);
                });
            });
            it("disallows an invalid signed request", () => {
                reqMock.headers.authorization = "blah blah";

                return runMiddlewareAsync().then(jasmine.fail, assertError("Invalid format of signature identifier.", "9iYNSNlY"));
            });
            it("allows a valid signed request", () => {
                return runMiddlewareAsync(authorizedHeader).then(() => {
                    expect(reqMock.signed).toBe(true);
                });
            });
        });
        describe("a signed request", () => {
            it("sets res.signed=true", () => {
                return runMiddlewareAsync(authorizedHeader).then(() => {
                    expect(reqMock.signed).toBe(true);
                });
            });
            it("fails without an Authorized header", () => {
                return runMiddlewareAsync().then(jasmine.fail, assertError("A signed message is required.", "0FLNjTwn"));
            });
        });
        describe("date window", () => {
            it("requires the date header", () => {
                delete reqMock.headers["x-opentoken-date"];

                return runMiddlewareAsync(authorizedHeader).then(jasmine.fail, assertError("Missing an X-OpenToken-Date header.", "B766z1D2"));
            });
            it("rejects if the date is in the past", () => {
                var pastDate;

                // 1 MS too far in the past.
                // This works because OtDate.plus doesn't do anything.
                pastDate = new Date(OtDateMock.now().date.getTime() - 1);
                reqMock.headers["x-opentoken-date"] = pastDate.toISOString();

                return runMiddlewareAsync(authorizedHeader).then(jasmine.fail, assertError("The X-OpenToken-Date header is too far in the past.", "JzFzaWPt"));
            });
            it("rejects if the date is in the future", () => {
                var futureDate;

                // 1 MS too far in the future.
                // This works because OtDate.plus doesn't do anything.
                futureDate = new Date(OtDateMock.now().date.getTime() + 1);
                reqMock.headers["x-opentoken-date"] = futureDate.toISOString();

                return runMiddlewareAsync(authorizedHeader).then(jasmine.fail, assertError("The X-OpenToken-Date header is in the future.", "uYom0uhM"));
            });
        });
        describe("host header", () => {
            it("must exist", () => {
                delete reqMock.headers.host;

                return runMiddlewareAsync(authorizedHeader).then(jasmine.fail, assertError("Missing a required header: Host", "VoFPGjHe"));
            });
            it("must match", () => {
                reqMock.headers.host = `wrong.${reqMock.headers.host}`;

                return runMiddlewareAsync(authorizedHeader).then(jasmine.fail, assertError("The host header did not match.  Required: example.com, Actual: wrong.example.com", "eBwqsCeZ"));
            });
        });
        describe("signature header", () => {
            // Note:  this library only verifies that the signature starts
            // with a known marker and it parses attributes, so only those
            // bits are tested here.
            it("requires a 4-part header", () => {
                return runMiddlewareAsync("OT1-HMAC-SHA256").then(jasmine.fail, assertError("Invalid format of signature identifier.", "9iYNSNlY"));
            });
            it("requires a the signature to start with OT1", () => {
                return runMiddlewareAsync("OTx-HMAC-SHA256-HEX").then(jasmine.fail, assertError("Invalid signature method in Authorized header.", "2HqEQm0k"));
            });
            it("works with any 4-part header that starts with OT1", () => {
                // This also tests the cleaning of the header, which
                // capitalizes and trims the value.
                return runMiddlewareAsync("      OT1-hmac-SHA256-whatever    ").then(() => {
                    var args;

                    args = signatureOt1Mock.authenticateAsync.mostRecentCall.args;

                    // Testing individually because it makes the error
                    // messages far easier to read.
                    expect(args[0]).toEqual(reqMock);
                    expect(args[1]).toEqual({
                        algorithm: "SHA256",
                        encoding: "WHATEVER",
                        method: "HMAC",
                        signature: "OT1-HMAC-SHA256-WHATEVER",
                        type: "OT1"
                    });
                    expect(args[2]).toEqual({});
                });
            });
            it("splits up complicated attributes", () => {
                return runMiddlewareAsync("OT1-A-B-C; aa=AA ;b=\"B;B=B;B\";c=;d=\"\"").then(() => {
                    var kvPairs;

                    // Only testing one parameter that is different from an
                    // earlier test in order to make any errors more readable.
                    kvPairs = signatureOt1Mock.authenticateAsync.mostRecentCall.args[2];
                    expect(kvPairs).toEqual({
                        aa: "AA",
                        b: "B;B=B;B",
                        c: "",
                        d: ""
                    });
                });
            });
            it("errors if an attribute is specified twice", () => {
                return runMiddlewareAsync("OT1-A-B-C; a=a;a=b").then(jasmine.fail, assertError("Duplicated attribute name in Authorized header: a", "QtlTT61E"));
            });
            it("errors if there's bad quoting (extra chars)", () => {
                return runMiddlewareAsync("OT1-A-B-C; a=\"a\"a").then(jasmine.fail, assertError("Invalid quoting in signature header", "pFDHKguh"));
            });
            it("errors if there's bad quoting (missing quote)", () => {
                return runMiddlewareAsync("OT1-A-B-C; a=\"a").then(jasmine.fail, assertError("Invalid quoting in signature header", "pFDHKguh"));
            });
        });
    });
});
