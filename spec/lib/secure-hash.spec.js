"use strict";

describe("secureHash", () => {
    var secureHash;

    beforeEach(() => {
        var base64, cryptoAsync, promiseMock;

        promiseMock = require("../mock/promise-mock")();
        cryptoAsync = promiseMock.promisifyAll(require("crypto"));
        base64 = require("../../lib/base64")();
        secureHash = require("../../lib/secure-hash")(base64, cryptoAsync, promiseMock);
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
        // Only one test here because this is more thoroughly tested
        // with pbkdf2IdAsync.
        it("hashes a passed in string", (done) => {
            secureHash.pbkdf2Async("rRTcBER_EiFUsRa34Hj5Zpok", {
                algorithm: "sha256",
                hashLength: 24,
                iterations: 10000,
                salt: "pinkFluffyUnicornsDancingOnRainbows"
            }).then((result) => {
                expect(result.toString("base64")).toBe("PR4ivl87GgN2bqA/tc3wA9O/HVcETOP5");
            }).then(done, done);
        });
    });
    describe("pbkdf2IdAsync()", () => {
        var hashConfig;

        beforeEach(() => {
            hashConfig = {
                algorithm: "sha256",
                hashLength: 24,
                iterations: 10000,
                salt: "pinkFluffyUnicornsDancingOnRainbows"
            };
        });
        it("hashes a passed in string", (done) => {
            secureHash.pbkdf2IdAsync("rRTcBER_EiFUsRa34Hj5Zpok", hashConfig).then((result) => {
                expect(result).toBe("PR4ivl87GgN2bqA_tc3wA9O_HVcETOP5");
            }).then(done, done);
        });
        it("hashes a passed in buffer", (done) => {
            secureHash.pbkdf2IdAsync(new Buffer("rRTcBER_EiFUsRa34Hj5Zpok", "binary"), hashConfig).then((result) => {
                expect(result).toBe("PR4ivl87GgN2bqA_tc3wA9O_HVcETOP5");
            }).then(done, done);
        });
        it("throws an error as there is nothing to hash", () => {
            expect(() => {
                secureHash.hashAsync("");
            }).toThrow();
        });
    });
});
