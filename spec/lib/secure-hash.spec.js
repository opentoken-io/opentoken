"use strict";

describe("secureHash", () => {
    var crypto, secureHash, secureHashConfig;

    secureHashConfig = {
        algorithm: "sha256",
        hashLength: 24,
        iterations: 10000,
        salt: "pinkFluffyUnicornsDancingOnRainbows"
    };
    beforeEach(() => {
        var base64, promiseMock;

        crypto = require("crypto");
        promiseMock = require("../mock/promise-mock");
        base64 = require("../../lib/base64")();
        secureHash = require("../../lib/secure-hash")(base64, crypto, promiseMock);
    });
    describe("secureHashAsync()", () => {
        it("hashes a passed in string", (done) => {
            secureHash.hashAsync("rRTcBER_EiFUsRa34Hj5Zpok", secureHashConfig).then((result) => {
                expect(result).toBe("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            }).then(done, done);
        });
        it("hashes a passed in buffer", (done) => {
            secureHash.hashAsync(new Buffer("rRTcBER_EiFUsRa34Hj5Zpok", "binary"), secureHashConfig).then((result) => {
                expect(result).toBe("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            }).then(done, done);
        });
        it("hashes without a config being passed in", (done) => {
            secureHash.hashAsync("rRTcBER_EiFUsRa34Hj5Zpok").then((result) => {
                expect(result).toBe("-IbPFNBgU7JvnlwV7IM_MR6Y9PaPd8gyJP7xZ_RzHjo0lcejcbWFgQcbXJJ2e9n1");
            }).then(done, done);
        });
        it("throws an error as there is nothing to hash", () => {
            expect(() => {
                secureHash.hashAsync("");
            }).toThrow();
        });
    });
    describe("secureHashCompareAsync()", () => {
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
});
