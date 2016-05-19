"use strict";

describe("secureHash", ()  => {
    var crypto, secureHash, secureHashConfig;

    secureHashConfig = {
        algorithm: "sha256",
        bytes: 24,
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
    describe("createSecureHashAsync()", () => {
        it("hashes a passed in string encoding for URI", (done) => {
            secureHashConfig.bytes = 23;
            secureHash.encodeUriAsync("p5>T44d3?12Ui", secureHashConfig).then((result) => {
                expect(result).toBe("bXJ1_lwcLc-8tElhLodLArAqeviypWg");
            }).then(done, done);
        });
        it("hashes a passed in string without encoding for URI", (done) => {
            secureHashConfig.bytes = 23;
            secureHash.encodeAsync("p5>T44d3?12Ui", secureHashConfig, true).then((result) => {
                expect(result).toBe("bXJ1/lwcLc+8tElhLodLArAqeviypWg=");
            }).then(done, done);
        });
        it("hashes a passed in buffer", (done) => {
            secureHash.encodeUriAsync(new Buffer("rRTcBER_EiFUsRa34Hj5Zpok", "binary"), secureHashConfig).then((result) => {
                expect(result).toBe("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_Tg");
            }).then(done, done);
        });
        it("hashes without a config being passed in", (done) => {
            secureHash.encodeUriAsync("rRTcBER_EiFUsRa34Hj5Zpok").then((result) => {
                expect(result).toBe("-IbPFNBgU7JvnlwV7IM_MR6Y9PaPd8gyJP7xZ_RzHjo0lcejcbWFgQcbXJJ2e9n1");
            }).then(done, done);
        });
        it("throws an error as there is nothing to hash", () => {
            expect(() => {
                secureHash.encodeUriAsync("");
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
    describe("createHash()", () => {
        it("creates successfully", () => {
            var result;

            result = secureHash.createHash("DpaKz8S7x8nHX1x5h8arrukZhM4WlLzcrEBeB4ko4hBb6M5K", "sha512");
            expect(result.length).toBe(88);
        });
    });
});
