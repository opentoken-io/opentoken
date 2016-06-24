"use strict";

describe("encoding", () => {
    var encoding;

    beforeEach(() => {
        var base64Mock;

        base64Mock = require("../mock/base64-mock")();
        encoding = require("../../lib/encoding")(base64Mock);
    });
    describe("decode()", () => {
        it("decodes base64", () => {
            expect(encoding.decode("Pj4+Pz8/YQ==", "base64")).toBe(">>>???a");
        });
        it("decodes base64-uri", () => {
            expect(encoding.decode("Pj4-Pz8_YQ", "base64-uri")).toBe(">>>???a");
        });
        it("throws on invalid method", () => {
            expect(() => {
                encoding.encode("anything", "wrong");
            }).toThrow("Invalid decoding method: wrong");
        });
    });
    describe("encode()", () => {
        it("encodes base64", () => {
            expect(encoding.encode(">>>???a", "base64")).toBe("Pj4+Pz8/YQ==");
        });
        it("decodes base64-uri", () => {
            expect(encoding.encode(">>>???a", "base64-uri")).toBe("Pj4-Pz8_YQ");
        });
        it("throws on invalid method", () => {
            expect(() => {
                encoding.decode("anything", "wrong");
            }).toThrow("Invalid encoding method: wrong");
        });
    });
});
