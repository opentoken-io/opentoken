"use strict";

describe("serialization", () => {
    var serialization;

    beforeEach(() => {
        var promiseMock, zlib;

        promiseMock = require("./mock/promise-mock");
        zlib = require("zlib");
        serialization = require("../lib/serialization")(promiseMock, zlib);
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
        it("serializes (version 0): " + scenario.name, () => {
            var promise;

            runs(() => {
                promise = serialization.serialize(scenario.plain);
            });
            waitsFor(() => {
                return promise.status();
            });
            runs(() => {
                var status;

                status = promise.status();
                status.value = status.value.toString("hex");
                expect(status).toEqual({
                    success: true,
                    value: scenario.hex
                });
            });
        });
        it("deserializes (version 0): " + scenario.name, () => {
            var promise;

            runs(() => {
                promise = serialization.deserialize(new Buffer(scenario.hex, "hex"));
            });
            waitsFor(() => {
                return promise.status();
            });
            runs(() => {
                var status;

                status = promise.status();
                status.value = status.value.toString("binary");
                expect(status).toEqual({
                    success: true,
                    value: scenario.plain
                });
            });
        });
    });
    [
        {
            deserializes: true,
            expires: new Date("2100-01-01T00:00:00Z"),
            hex: "006518000000323130302d30312d30315430303a30303a30302e3030305a6306000000333432360100",
            name: "future date",
            plain: "1234"
        },
        {
            deserializes: false,
            expires: new Date("2000-01-01T00:00:00Z"),
            hex: "006518000000323030302d30312d30315430303a30303a30302e3030305a6306000000333432360100",
            name: "past date",
            plain: "1234"
        }
    ].forEach((scenario) => {
        it("serializes (version 1): " + scenario.name, () => {
            var promise;

            runs(() => {
                promise = serialization.serialize(scenario.plain, {
                    expires: scenario.expires
                });
            });
            waitsFor(() => {
                return promise.status();
            });
            runs(() => {
                var status;

                status = promise.status();
                status.value = status.value.toString("hex");
                expect(status).toEqual({
                    success: true,
                    value: scenario.hex
                });
            });
        });
        it("deserializes (version 1): " + scenario.name, () => {
            var promise;

            runs(() => {
                promise = serialization.deserialize(new Buffer(scenario.hex, "hex"));
            });
            waitsFor(() => {
                return promise.status();
            });
            runs(() => {
                var status;

                status = promise.status();
                status.value = status.value.toString("binary");

                if (scenario.deserializes) {
                    expect(status).toEqual({
                        success: true,
                        value: scenario.plain
                    });
                } else {
                    expect(status).toEqual({
                        success: false,
                        value: "Error: Expired"
                    });
                }
            });
        });
    });
});
