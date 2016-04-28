"use strict";

describe("secureHash", ()  => {
    var secureHash, crypto;

    beforeEach(() => {
        var base64, promiseMock;

        crypto = require("crypto");
        promiseMock = require("./mock/promise-mock");
        base64 = require("../lib/base64");
        secureHash = require("../lib/secure-hash")(base64, crypto, promiseMock);
    });
    it("hashes a passed in string", (done) => {
        secureHash.hashAsync("rRTcBER_EiFUsRa34Hj5Zpok", {
            algorithm: "sha256",
            hashLength: 24,
            iterations: 10000,
            salt: "pinkFluffyUnicornsDancingOnRainbows"
        }).then((result) => {
            expect(result).toBe("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
        }).then(done, done);
    });
    it("hashes a passed in buffer", (done) => {
        secureHash.hashAsync(new Buffer("rRTcBER_EiFUsRa34Hj5Zpok", "binary"), {
            algorithm: "sha256",
            hashLength: 24,
            iterations: 10000,
            salt: "pinkFluffyUnicornsDancingOnRainbows"
        }).then((result) => {
            expect(result).toBe("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
        }).then(done, done);
    });

    /**
     * Just grabbing the first 32 Bytes and last 32 Bytes to verify the string
     * is what we are expecting as the actual length is very long.
     */
    it("hashes without a config being passed in", (done) => {
        secureHash.hashAsync("rRTcBER_EiFUsRa34Hj5Zpok").then((result) => {
            expect(result).toBe("-IbPFNBgU7JvnlwV7IM_MR6Y9PaPd8gyJP7xZ_RzHjo0lcejcbWFgQcbXJJ2e9n1");
            expect(result.length).toBe(64);
        }).then(done, done);
    });
    it("throws an error as there is nothing to hash", () => {
        expect(() => {
            secureHash.hashAsync("");
        }).toThrow();
    });
});