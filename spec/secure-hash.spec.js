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
    it("hashes a passed in value", (done) => {
        secureHash.hashAsync("rRTcBER_EiFUsRa34Hj5Zpok", {
            algorithm: "sha256",
            hashLength: 24,
            iterations: 10000,
            salt: "pinkFluffyUnicornsDancingOnRainbows"
        }).then((result) => {
            expect(result.toString("binary")).toBe("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
        }).then(done, done);
    });
    it("hashes without a config being passed in", (done) => {
        secureHash.hashAsync("rRTcBER_EiFUsRa34Hj5Zpok").then((result) => {
            expect(result.toString("binary").length).toBe(683);
        }).then(done, done);
    });
    it("throws and error as there is nothing to hash", () => {
        expect(() => {
            secureHash.hashAsync("");
        }).toThrow();
    });
});