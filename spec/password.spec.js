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
        expect(password.hashContent("rRTcBER_EiFUsRa34Hj5Zpok")).not.toBe("rRTcBER_EiFUsRa34Hj5Zpok");
    });
    it("returns false as there's nothing to hash", () => {
        expect(password.hashContent("")).toBe(false);
    });
});