"use strict";

describe("hash", () => {
    var encodingMock, hash;

    beforeEach(() => {
        var cryptoAsync, promiseMock;

        promiseMock = require("../mock/promise-mock")();
        cryptoAsync = promiseMock.promisifyAll(require("crypto"));
        encodingMock = require("../mock/encoding-mock")();
        hash = require("../../lib/hash")(cryptoAsync, encodingMock, promiseMock);
    });
    describe("compare()", () => {
        it("compares successfully", () => {
            var result;

            result = hash.compare("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR", "9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            expect(result).toBe(true);
        });
        it("compares and the lengths do not match", () => {
            var result;

            result = hash.compare("9GnOLZ_xAlfMA4C6DHsjNJJps", "9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            expect(result).toBe(false);
        });
        it("compares the same length but the values do not match by one", () => {
            var result;

            result = hash.compare("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_Tg5", "9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            expect(result).toBe(false);
        });
    });
    describe("deriveAsync()", () => {
        it("hashes a passed in string", (done) => {
            hash.deriveAsync("rRTcBER_EiFUsRa34Hj5Zpok", {
                algorithm: "sha256",
                derivedLength: 24,
                // The encoding is not honored due to it being a mock
                encoding: "base64-uri",
                iterations: 10000,
                salt: "pinkFluffyUnicornsDancingOnRainbows",
                type: "pbkdf2"
            }).then((result) => {
                expect(result).toBe("PR4ivl87GgN2bqA/tc3wA9O/HVcETOP5");
            }).then(done, done);
        });
        it("hashes a passed in buffer", (done) => {
            hash.deriveAsync(new Buffer("rRTcBER_EiFUsRa34Hj5Zpok", "binary"), {
                algorithm: "sha256",
                derivedLength: 24,
                encoding: "base64",
                iterations: 10000,
                salt: "pinkFluffyUnicornsDancingOnRainbows",
                type: "pbkdf2"
            }).then((result) => {
                expect(result).toBe("PR4ivl87GgN2bqA/tc3wA9O/HVcETOP5");
            }).then(done, done);
        });
        it("rejects when there is no data", (done) => {
            jasmine.testPromiseFailure(hash.deriveAsync(new Buffer("", "binary"), {
                algorithm: "sha256",
                derivedLength: 24,
                encoding: "base64",
                iterations: 10000,
                salt: "pinkFluffyUnicornsDancingOnRainbows",
                type: "pbkdf2"
            }), "Nothing to hash", done);
        });
        it("rejects with an invalid type", (done) => {
            jasmine.testPromiseFailure(hash.deriveAsync("data", {
                algorithm: "sha256",
                derivedLength: 24,
                encoding: "base64",
                iterations: 10000,
                salt: "salty",
                type: "unknown"
            }), "Invalid hash type configuration", done);
        });
        it("calls the encoding library", (done) => {
            hash.deriveAsync("data", {
                algorithm: "sha256",
                derivedLength: 10,
                encoding: "base64",
                iterations: 100,
                type: "pbkdf2"
            }).then((result) => {
                expect(result).toBe("NUgunJKn8yBcnQ==");
                expect(encodingMock.encode).toHaveBeenCalledWith(jasmine.any(Buffer), "base64");
            }).then(done, done);
        });
    });
});
