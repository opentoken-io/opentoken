"use strict";

describe("random", () => {
    var base64, random;

    beforeEach(() => {
        var cryptoAsyncMock;

        base64 = require("../../lib/base64")();
        spyOn(base64, "encode").andReturn(new Buffer("abcdwxyzABCDWXYZ0189+/testing++//"));
        cryptoAsyncMock = require("../mock/crypto-async-mock")();
        random = require("../../lib/random")(base64, cryptoAsyncMock);
    });
    describe("bufferAsync", () => {
        it("returns a Promise", () => {
            var result;

            result = random.bufferAsync(12);
            expect(result).toEqual(jasmine.any(Object));
            expect(result.then).toEqual(jasmine.any(Function));
        });
        it("generates appropriately-sized random data Buffer", () => {
            return random.bufferAsync(1293).then((buff) => {
                expect(buff).toEqual(jasmine.any(Buffer));
                expect(buff.length).toBe(1293);
            });
        });
    });
    describe("idAsync", () => {
        [
            {
                binLength: 24,
                desiredLength: 30,
                expected: "abcdwxyzABCDWXYZ0189-_testing-"
            },
            {
                binLength: 24,
                desiredLength: 31,
                expected: "abcdwxyzABCDWXYZ0189-_testing--"
            },
            {
                binLength: 24,
                desiredLength: 32,
                expected: "abcdwxyzABCDWXYZ0189-_testing--_"
            },
            {
                binLength: 27,
                desiredLength: 33,
                expected: "abcdwxyzABCDWXYZ0189-_testing--__"
            }
        ].forEach((scenario) => {
            it(`sends the right amount of binary data to base64: length ${scenario.desiredLength}`, () => {
                return random.idAsync(scenario.desiredLength).then(() => {
                    expect(base64.encode.mostRecentCall.args[0].length).toBe(scenario.binLength);
                });
            });
            it(`replaced + and /: length ${scenario.desiredLength}`, () => {
                return random.idAsync(scenario.desiredLength).then((pass) => {
                    expect(pass).toEqual(scenario.expected);
                });
            });
        });
    });
});
