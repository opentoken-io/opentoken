"use strict";

describe("encoding", () => {
    var encoding;

    beforeEach(() => {
        var base32, base64, binaryBufferMock, hex;

        binaryBufferMock = require("../mock/binary-buffer-mock")();
        base32 = require("../../lib/base32")(binaryBufferMock, require("thirty-two"));
        base64 = require("../../lib/base64")(binaryBufferMock);
        hex = require("../../lib/hex")(binaryBufferMock);
        encoding = require("../../lib/encoding")(base32, base64, hex);
    });
    describe("decode()", () => {
        /**
         * Simple function to test if something decoded well.
         *
         * @param {string} encoded
         * @param {string} method
         * @param {string} expected
         */
        function checkBuffer(encoded, method, expected) {
            var buff;

            expect(() => {
                buff = encoding.decode(encoded, method);
            }).not.toThrow();
            expect(Buffer.isBuffer(buff)).toBe(true);
            expect(buff.toString("binary")).toEqual(expected);
        }

        it("decodes base32", () => {
            checkBuffer("MFRGGII=", "base32", "abc!");
        });
        it("decodes base32-uri", () => {
            checkBuffer("MFRGGII", "base32-uri", "abc!");
        });
        it("decodes base64", () => {
            checkBuffer("Pj4+Pz8/YQ==", "base64", ">>>???a");
        });
        it("decodes base64-uri", () => {
            checkBuffer("Pj4-Pz8_YQ", "base64-uri", ">>>???a");
        });
        it("decodes hex", () => {
            checkBuffer("616a", "hex", "aj");
        });
        it("throws on invalid method", () => {
            expect(() => {
                encoding.decode("anything", "wrong");
            }).toThrow("Invalid decoding method: wrong");
        });
    });
    describe("encode()", () => {
        it("encodes base32", () => {
            expect(encoding.encode("abc!", "base32")).toBe("MFRGGII=");
        });
        it("encodes base32-uri", () => {
            expect(encoding.encode("abc!", "base32-uri")).toBe("MFRGGII");
        });
        it("encodes base64", () => {
            expect(encoding.encode(">>>???a", "base64")).toBe("Pj4+Pz8/YQ==");
        });
        it("encodes base64-uri", () => {
            expect(encoding.encode(">>>???a", "base64-uri")).toBe("Pj4-Pz8_YQ");
        });
        it("encodes hex", () => {
            expect(encoding.encode("aj", "hex")).toBe("616a");
        });
        it("throws on invalid method", () => {
            expect(() => {
                encoding.encode("anything", "wrong");
            }).toThrow("Invalid encoding method: wrong");
        });
    });
});
