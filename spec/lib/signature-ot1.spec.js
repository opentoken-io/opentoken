"use strict";

describe("signatureOt1", () => {
    var accessCodeManagerMock, ErrorResponse, hashMock, kvPairs, promiseMock, requestMock, signatureDescription, signatureLib, verifySignature;

    /**
     * Checks an error to make sure it is the right error.  The error
     * object is typically provided by a failed promise.
     *
     * @param {string} message Expected message
     * @param {string} code Expected code
     * @return {Function} Assertion function for the promise
     */
    function assertError(message, code) {
        return (err) => {
            expect(err).toEqual(jasmine.any(ErrorResponse));
            expect(err.message).toBe(message);
            expect(err.code).toBe(code);
        };
    }

    beforeEach(() => {
        var binaryBufferMock, utilMock;

        accessCodeManagerMock = require("../mock/manager/access-code-manager-mock")();
        binaryBufferMock = require("../mock/binary-buffer-mock")();
        hashMock = require("../mock/hash-mock")();
        promiseMock = require("../mock/promise-mock")();
        requestMock = require("../mock/request-mock")();
        utilMock = require("../mock/util-mock")();
        ErrorResponse = require("../../lib/error-response")(promiseMock);

        hashMock.hmac.andReturn("FakeSignature");
        requestMock.headers.host = "example.com";
        requestMock.headers["x-opentoken-date"] = "2010-01-01T01:23:45Z";
        requestMock.headers["content-type"] = "text/plain";
        signatureLib = require("../../lib/signature-ot1")(accessCodeManagerMock, binaryBufferMock, ErrorResponse, hashMock, promiseMock, utilMock);
        kvPairs = {
            "access-code": "FakeAccessCode",
            signature: "FakeSignature",
            "signed-headers": "host x-opentoken-date content-type"
        };
        signatureDescription = {
            algorithm: "SHA256",
            encoding: "HEX",
            method: "HMAC"
        };
        verifySignature = () => {
            return signatureLib.authenticateAsync(requestMock, signatureDescription, kvPairs);
        };
    });
    it("exposes known methods", () => {
        expect(Object.keys(signatureLib).sort()).toEqual([
            "authenticateAsync"
        ]);
    });
    describe("with a bad signature description", () => {
        it("requires HMAC method", () => {
            signatureDescription.method = "HASH";

            return verifySignature().then(jasmine.fail, assertError("Prohibited method, only HMAC allowed: HASH", "X3A8VmGT"));
        });
        it("requires SHA256 algorithm", () => {
            signatureDescription.algorithm = "MD5";

            return verifySignature().then(jasmine.fail, assertError("Prohibited algorithm, only SHA256 allowed: MD5", "QpEMHUg5"));
        });
        it("requires HEX encoding", () => {
            signatureDescription.encoding = "BASE64";

            return verifySignature().then(jasmine.fail, assertError("Prohibited encoding, only HEX allowed: BASE64", "B7q03SsU"));
        });
    });
    describe("with bad attributes", () => {
        it("detects a missing attribute", () => {
            delete kvPairs["access-code"];

            return verifySignature().then(jasmine.fail, assertError("Missing required attributes: access-code", "IHyLdqig"));
        });
        it("detects an extra attribute", () => {
            kvPairs["security-key"] = "FakeSecurityKey";

            return verifySignature().then(jasmine.fail, assertError("Prohibited extra attributes: security-key", "iqpoGKJk"));
        });
    });
    describe("signed headers", () => {
        it("trims the headers and does not sort them", () => {
            // This tests several things at once:
            //   * Trimming
            //   * Changing to lowercase
            //   * The list is unsorted
            // This is easier to test by triggering an error and bypassing
            // a lot of the work that the module does.
            kvPairs["signed-headers"] = "   x   yYy   Zz-Zz mmm   ";

            return verifySignature().then(jasmine.fail, assertError("Signed header list (x, yyy, zz-zz, mmm) is missing required headers: content-type, host, x-opentoken-date", "6I5IliIZ"));
        });
        it("shows when a required header is missing", () => {
            kvPairs["signed-headers"] = "host x-opentoken-date content-length";

            return verifySignature().then(jasmine.fail, assertError("Signed header list (host, x-opentoken-date, content-length) is missing required headers: content-type", "6I5IliIZ"));
        });
    });
    describe("private key", () => {
        it("fails when the access code + account is invalid", () => {
            accessCodeManagerMock.getAsync.andCallFake(() => {
                return promiseMock.reject();
            });

            return verifySignature().then(jasmine.fail, assertError("Invalid account ID or access code.", "76rEUePY"));
        });
    });
    describe("when checking the signature", () => {
        it("hashes with the right settings", () => {
            var content;

            // Easier to show this as an array than a template or a string.
            content = [
                "GET",
                "/path",
                "",
                "host:example.com",
                "x-opentoken-date:2010-01-01T01:23:45Z",
                "content-type:text/plain",
                "",
                ""
            ];

            return verifySignature().then(() => {
                expect(hashMock.hmac).toHaveBeenCalledWith(content.join("\n"), {
                    algorithm: "sha256",
                    encoding: "hex",
                    secret: "Secret key"
                });
            });
        });
        it("uses the secure hash compare function", () => {
            // This does NOT trigger an error because hashMock.compare
            // always returns true unless configured differently.
            kvPairs.signature = "Signature from header";

            return verifySignature().then(() => {
                expect(hashMock.compare).toHaveBeenCalledWith("FakeSignature", "Signature from header");
            });
        });
        it("fails when hashes don't match", () => {
            hashMock.compare.andReturn(false);

            return verifySignature().then(jasmine.fail, assertError("Signature verification mismatch.", "k6JoBvzV"));
        });
    });
    describe("successful results", () => {
        it("sanitizes the headers", () => {
            requestMock.headers.unsigned = "This is an unsigned header";

            return verifySignature().then(() => {
                expect(Object.keys(requestMock.headers).sort()).toEqual([
                    "content-type",
                    "host",
                    "x-opentoken-date"
                ]);
            });
        });
        it("converts a body Buffer as binary", () => {
            var content;

            // Easier to represent individual lines as an array
            content = [
                "GET",
                "/path",
                "",
                "host:example.com",
                "x-opentoken-date:2010-01-01T01:23:45Z",
                "content-type:text/plain",
                "",

                // If you see \xf1 (ñ in extended ASCII) then the test
                // is screwed up somehow.
                "\xc3\xb1\x0a"
            ];

            // The buffer is "ñ\n" encoded as UTF-8
            requestMock.body = new Buffer("c3b10a", "hex");

            return verifySignature().then(() => {
                expect(hashMock.hmac).toHaveBeenCalledWith(content.join("\n"), jasmine.any(Object));
            });
        });
    });
});
