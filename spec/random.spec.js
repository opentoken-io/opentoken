"use strict";

describe("random", () => {
    var base64Mock, random;

    beforeEach(() => {
        var crypto, promiseMock;

        base64Mock = jasmine.createSpyObj("base64", [
            "encode"
        ]);
        base64Mock.encode.andReturn(new Buffer("abcdwxyzABCDWXYZ0189+/testing++//"));
        crypto = require("crypto");
        promiseMock = require("./mock/promise-mock");
        random = require("../lib/random")(base64Mock, crypto, promiseMock);
    });
    describe("bufferAsync", () => {
        it("returns a Promise", () => {
            var result;

            result = random.bufferAsync(12);
            expect(result).toEqual(jasmine.any(Object));
            expect(result.then).toEqual(jasmine.any(Function));
        });
        it("generates appropriately-sized random data Buffer", (done) => {
            random.bufferAsync(1293).then((buff) => {
                expect(buff).toEqual(jasmine.any(Buffer));
                expect(buff.length).toBe(1293);
            }).then(done, done);
        });
    });
    describe("password", () => {
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
            it("sends the right amount of binary data to base64: length " + scenario.desiredLength, (done) => {
                random.passwordAsync(scenario.desiredLength).then(() => {
                    expect(base64Mock.encode.mostRecentCall.args[0].length).toBe(scenario.binLength);
                }).then(done, done);
            });
            it("replaced + and /: length " + scenario.desiredLength, () => {
                random.passwordAsync(scenario.desiredLength).then((pass) => {
                    expect(pass).toEqual(scenario.expected);
                });
            });
        });
    });
});
