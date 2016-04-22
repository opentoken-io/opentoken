"use strict";

describe("password", ()  => {
    var password, cryptoFake;

    beforeEach(() => {
        cryptoFake = jasmine.createSpyObj("cryptoFake", [
            "createHash",
            "digest",
            "update"
        ]);
        cryptoFake.createHash = jasmine.createSpy("crypto.createHash").andReturn(cryptoFake);
        cryptoFake.digest = jasmine.createSpy("crypto.digest").andReturn("hashedcontent");
        cryptoFake.update = jasmine.createSpy("crypto.update").andReturn(cryptoFake);
        password = require("../lib/password")(cryptoFake);
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