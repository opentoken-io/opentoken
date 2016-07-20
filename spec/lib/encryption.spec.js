/* eslint no-bitwise:"off" */

"use strict";

describe("encryption", () => {
    var encryption;

    beforeEach(() => {
        var ciphersAndHashes, cryptoAsync, promiseMock, randomMock;

        ciphersAndHashes = require("../../lib/ciphers-and-hashes")();
        promiseMock = require("../mock/promise-mock")();
        cryptoAsync = require("../mock/crypto-async-mock")();
        randomMock = require("../mock/random-mock")();
        encryption = require("../../lib/encryption")(ciphersAndHashes, cryptoAsync, promiseMock, randomMock);
    });
    it("encrypts from a buffer with a key as a buffer", () => {
        // The rest of the tests use Buffers because it is WAY easier
        return encryption.encryptAsync(new Buffer("as a string", "binary"), new Buffer("key", "binary"), {
            algorithm: "md5",
            digest: "sha1",
            iterations: 50
        }, {
            algorithm: "seed-cfb",
            digest: "ripemd",
            iterations: 29
        }).then((result) => {
            expect(result.toString("hex")).toEqual("0001053200000040031d0000000b00000053f8a825e3b1c5e9537c20800324153042424242424242424242424242424242e94cea7494417116671128");
        });
    });
    it("decrypts from a string with a key as a buffer", () => {
        // The rest of the tests use Buffers because it is WAY easier
        var asString;

        asString = (new Buffer("0001053200000040031d0000000b00000053f8a825e3b1c5e9537c20800324153042424242424242424242424242424242e94cea7494417116671128", "hex")).toString("binary");

        return encryption.decryptAsync(asString, new Buffer("key")).then((result) => {
            expect(result.toString("binary")).toEqual("as a string");
        });
    });
    describe("error handling", () => {
        var buff, cipherConfig, hmacConfig, keySource, plain;

        beforeEach(() => {
            // These are identical to the result from the "decrypts from
            // string and key from buffer" test, immediately above, but
            // all of the config is here so you can generate this again.
            buff = new Buffer("0001053200000040031d0000000b00000053f8a825e3b1c5e9537c20800324153042424242424242424242424242424242e94cea7494417116671128", "hex");
            keySource = "key";
            hmacConfig = {
                algorithm: "md5",
                digest: "sha1",
                iterations: 50
            };
            cipherConfig = {
                algorithm: "seed-cfb",
                digest: "ripemd",
                iterations: 29
            };
            plain = "as a string";
        });
        it("errors with invalid HMAC", () => {
            buff[20] ^= 0xF;

            return encryption.decryptAsync(buff, keySource).then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("HMAC invalid");
            });
        });
        [
            {
                byte: 1,
                config: "hmacConfig",
                property: "algorithm",
                text: "HMAC Algorithm"
            },
            {
                byte: 2,
                config: "hmacConfig",
                property: "digest",
                text: "HMAC Key Digest"
            },
            {
                byte: 7,
                config: "cipherConfig",
                property: "algorithm",
                text: "Cipher Algorithm"
            },
            {
                byte: 8,
                config: "cipherConfig",
                property: "digest",
                text: "Cipher Key Digest"
            }
        ].forEach((scenario) => {
            it(`errors with invalid encoding parameters - ${scenario.text}`, () => {
                var config;

                config = {
                    hmacConfig,
                    cipherConfig
                };
                config[scenario.config][scenario.property] = "invalid";

                return encryption.encryptAsync(plain, keySource, hmacConfig, cipherConfig).then(jasmine.fail, (err) => {
                    expect(err.toString()).toContain(scenario.text);
                });
            });
            it(`errors with invalid header config - ${scenario.text}`, () => {
                buff[scenario.byte] = 0xFF;

                return encryption.decryptAsync(buff, keySource).then(jasmine.fail, (err) => {
                    expect(err.toString()).toContain(scenario.text);
                });
            });
        });
    });
    [
        {
            cipherConfig: {
                algorithm: "aes-256-cbc",
                digest: "sha512",
                iterations: 10000
            },
            encryptedHex: "000a01e80300000d09e8030000100000004b3cfb354d2466f556302bc1ad153d9e470bd9e83530bc418a80cda1d4b6afdc81a3668dd9e340bf10100a8b6cf27118e70708b6d37be615ea72c65b54121e6c424242424242424242424242424242429a39d83c5fffaa4d0fc85154d2990734",
            hmacConfig: {
                algorithm: "whirlpool",
                digest: "md5",
                iterations: 1000
            },
            keySource: "My voice is my passport, verify me.",
            name: "simple encryption",
            plain: "abcdefg"
        }
    ].forEach((scenario) => {
        it(`encrypts in the latest version: ${scenario.name}`, () => {
            return encryption.encryptAsync(scenario.plain, scenario.keySource, scenario.hmacConfig, scenario.cipherConfig).then((result) => {
                expect(result.toString("hex")).toEqual(scenario.encryptedHex);
            });
        });
        it(`decrypts the latest version: ${scenario.name}`, () => {
            return encryption.decryptAsync(new Buffer(scenario.encryptedHex, "hex"), scenario.keySource).then((result) => {
                expect(result.toString("binary")).toEqual(scenario.plain);
            });
        });
    });
    describe("backwards compatibility with all versions", () => {
        it("errors with version 1", () => {
            // When you update this test, make sure to add another that checks
            // the new version you've added.
            return encryption.decryptAsync("\x01", "anything").then(() => {
                expect(true).toBe(false);
            }, (err) => {
                expect(err.toString()).toContain("Invalid header version");
            });
        });
        it("decrypts version 0", () => {
            var buff;

            buff = new Buffer("0001053200000040031d0000000b00000053f8a825e3b1c5e9537c20800324153042424242424242424242424242424242e94cea7494417116671128", "hex");

            return encryption.decryptAsync(buff, "key").then((result) => {
                expect(result.toString()).toEqual("as a string");
            });
        });
    });
});
