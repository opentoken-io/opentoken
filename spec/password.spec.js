"use strict";

describe("password", ()  => {
    var password, crypto;

    beforeEach(() => {
        var config;

        crypto = require("crypto");
        config = {
            password: {
                hashAlgo: "sha256"
            }
        };
        password = require("../lib/password")(config, crypto);
    });
    it("hashes a passed in value", () => {
        expect(password.hashContent("rRTcBER_EiFUsRa34Hj5Zpok")).toBe("_cH_6uOc_gyL4-FvEsTWUj_YrCZD9NMmOl-2TT0d1NU=");
    });
    it("throws and error as there is nothing to hash", () => {
        expect(() => {
            password.hashContent("");
        }).toThrow();
    });
});