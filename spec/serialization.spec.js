"use strict";

describe("serialization", () => {
    var otDateMock, serialization;

    beforeEach(() => {
        var promiseMock, zlib;

        otDateMock = require("./mock/ot-date-mock");
        promiseMock = require("./mock/promise-mock");
        zlib = require("zlib");
        serialization = require("../lib/serialization")(otDateMock, promiseMock, zlib);
    });
    it("serializes a buffer", (done) => {
        // The rest of the tests use strings for ease
        serialization.serializeAsync(new Buffer("testing")).then((result) => {
            expect(result.toString("hex")).toEqual("0063090000002b492d2ec9cc4b0700");
        }).then(done, done);
    });
    it("deserializes a string", (done) => {
        serialization.deserializeAsync((new Buffer("0063090000002b492d2ec9cc4b0700", "hex")).toString("binary")).then((result) => {
            expect(result.toString("binary")).toEqual("testing");
        }).then(done, done);
    });
    [
        {
            // "moo" is larger when compressed, thus that's why there
            // are 5 bytes in the compressed data after the header.
            hex: "006305000000cbcdcf0700",
            name: "moo",
            plain: "moo"
        },
        {
            // This ensures the data is compressed before encrypting
            hex: "0063090000004b2c4e494b24010300",
            name: "asdf 12 times",
            plain: "asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf"
        }
    ].forEach((scenario) => {
        it("serializes (version 0): " + scenario.name, (done) => {
            serialization.serializeAsync(scenario.plain).then((result) => {
                expect(result.toString("hex")).toEqual(scenario.hex);
            }).then(done, done);
        });
        it("deserializes (version 0): " + scenario.name, (done) => {
            serialization.deserializeAsync(new Buffer(scenario.hex, "hex")).then((result) => {
                expect(result.toString("binary")).toEqual(scenario.plain);
            }).then(done, done);
        });
    });
    [
        {
            deserializes: true,
            expiresStr: "2100-01-01T00:00:00Z",
            hex: "01005786f46306000000333432360100",
            name: "future date",
            plain: "1234"
        },
        {
            deserializes: false,
            expiresStr: "2000-01-01T00:00:00Z",
            hex: "0180436d386306000000333432360100",
            name: "past date",
            plain: "1234"
        }
    ].forEach((scenario) => {
        it("serializes (version 1): " + scenario.name, (done) => {
            serialization.serializeAsync(scenario.plain, {
                expires: otDateMock.fromString(scenario.expiresStr)
            }).then((result) => {
                expect(result.toString("hex")).toEqual(scenario.hex);
            }).then(done, done);
        });
        it("deserializes (version 1): " + scenario.name, (done) => {
            serialization.deserializeAsync(new Buffer(scenario.hex, "hex")).then((result) => {
                expect(scenario.deserializes).toBe(true);
                expect(result.toString("binary")).toEqual(scenario.plain);
                done();
            }, (err) => {
                expect(scenario.deserializes).toBe(false);
                expect(err).toEqual(jasmine.any(Error));
                done();
            });
        });
    });


    /**
     * Ensure backwards compatibility for all previous serialization formats.
     */
    [
        {
            hex: "006305000000cbcdcf0700",
            name: "version 0",
            plain: "moo"
        },
        {
            hex: "01005786f46306000000333432360100",
            name: "version 1 - expires 2100-01-01T00:00:00Z",
            plain: "1234"
        }
    ].forEach((scenario) => {
        it("deserializes: " + scenario.name, (done) => {
            serialization.deserializeAsync(new Buffer(scenario.hex, "hex")).then((result) => {
                expect(result.toString("binary")).toEqual(scenario.plain);
            }).then(done, done);
        });
    });


    /**
     * Handle errors
     */
    describe("error handling", () => {
        it("does not parse the next version number", (done) => {
            // When you update this test, PLEASE make sure to add a new
            // test in the "backwards compatibility" section!
            jasmine.testPromiseFailure(serialization.deserializeAsync("\x02"), "Invalid serialized version identifier", done);
        });
        it("dies at an invalid chunk character (versions 0, 1)", (done) => {
            // "e" chunk has length of 0, so it reads.
            // Later it is parsed and "e" is an invalid chunk type.
            jasmine.testPromiseFailure(serialization.deserializeAsync("\x00e\x00\x00\x00\x00"), "Invalid chunk at", done);
        });
        it("dies at an invalid chunk length (versions 0, 1)", (done) => {
            // Length of "x" chunk is 2 bytes, but only 1 byte is
            // available.
            jasmine.testPromiseFailure(serialization.deserializeAsync("\x00x\x02\x00\x00\x00m"), "Corrupt", done);
        });
        it("dies when there is no compresed data (versions 0, 1)", (done) => {
            jasmine.testPromiseFailure(serialization.deserializeAsync("\x00"), "No compressed data", done);
        });
    });
});
