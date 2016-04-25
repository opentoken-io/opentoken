"use strict";

describe("password", ()  => {
    var password, cryptoFake;

    beforeEach(() => {
        var config;

        cryptoFake = jasmine.createSpyObj("cryptoFake", [
            "createHash",
            "digest",
            "update"
        ]);
        cryptoFake.createHash = jasmine.createSpy("crypto.createHash").andReturn(cryptoFake);
        cryptoFake.digest = jasmine.createSpy("crypto.digest").andReturn("hashedcontent");
        cryptoFake.update = jasmine.createSpy("crypto.update").andReturn(cryptoFake);
        config = {
            password: {
                hashAlgo: "sha256"
            }
        };
        password = require("../lib/password")(config, cryptoFake);
    });
    it("hashes a passed in value", () => {
        expect(password.hashContent("contenttohash")).toBe("hashedcontent");
        expect(cryptoFake.update).toHaveBeenCalledWith("contenttohash");
    });
    it("returns false as there's nothing to hash", () => {
        expect(password.hashContent("")).toBe(false);
        expect(cryptoFake.update).not.toHaveBeenCalled();
    });
});