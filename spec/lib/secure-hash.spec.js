"use strict";

describe("secureHash", () => {
    var secureHash;

    beforeEach(() => {
        var base64Mock, cryptoAsync, promiseMock;

        promiseMock = require("../mock/promise-mock")();
        cryptoAsync = promiseMock.promisifyAll(require("crypto"));
        base64Mock = require("../mock/base64-mock")();
        secureHash = require("../../lib/secure-hash")(base64Mock, cryptoAsync);
    });
    describe("compare()", () => {
        it("compares successfully", () => {
            var result;

            result = secureHash.compare("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR", "9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            expect(result).toBe(true);
        });
        it("compares and the lengths do not match", () => {
            var result;

            result = secureHash.compare("9GnOLZ_xAlfMA4C6DHsjNJJps", "9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            expect(result).toBe(false);
        });
        it("compares the same length but the values do not match by one", () => {
            var result;

            result = secureHash.compare("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_Tg5", "9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            expect(result).toBe(false);
        });
    });
    describe("pbkdf2Async()", () => {
        it("hashes a passed in string", (done) => {
            secureHash.pbkdf2Async("rRTcBER_EiFUsRa34Hj5Zpok", {
                algorithm: "sha256",
                derivedLength: 24,
                iterations: 10000
            }).then((result) => {
                expect(result.toString("base64")).toBe("gamhxTutw1xATEyonZ2HdUNlsNwMZvMS");
            }).then(done, done);
        });
        it("throws when there is no data to hash", () => {
            expect(() => {
                secureHash.pbkdf2Async("", {
                    algorithm: "sha256",
                    derivedLength: 24,
                    iterations: 10000
                });
            }).toThrow("Nothing to hash");
        });
    });
    describe("hashAsync()", () => {
        it("hashes a passed in string", (done) => {
            secureHash.hashAsync("rRTcBER_EiFUsRa34Hj5Zpok", {
                algorithm: "sha256",
                derivedLength: 24,
                encoding: "base64-uri",
                iterations: 10000,
                salt: "pinkFluffyUnicornsDancingOnRainbows",
                type: "pbkdf2"
            }).then((result) => {
                expect(result).toBe("PR4ivl87GgN2bqA_tc3wA9O_HVcETOP5");
            }).then(done, done);
        });
        it("hashes a passed in buffer", (done) => {
            secureHash.hashAsync(new Buffer("rRTcBER_EiFUsRa34Hj5Zpok", "binary"), {
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
        it("throws an error with an invalid type", () => {
            expect(() => {
                secureHash.hashAsync("data", {
                    algorithm: "sha256",
                    encoding: "base64",
                    hashLength: 24,
                    iterations: 10000,
                    salt: "salty",
                    type: "unknown"
                });
            }).toThrow("Invalid hash type configuration");
        });
        it("throws an error with an invalid encoding method", () => {
            expect(() => {
                secureHash.hashAsync("data", {
                    algorithm: "sha256",
                    encoding: "broken",
                    hashLength: 24,
                    iterations: 10000,
                    salt: "salty",
                    type: "pbkdf2"
                });
            }).toThrow("Invalid hash encoding configuration");
        });
    });
});
