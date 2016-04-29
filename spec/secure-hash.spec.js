"use strict";

describe("secureHash", ()  => {
    var crypto, secureHash, secureHashConfig;

    secureHashConfig = {
        algorithm: "sha256",
        hashLength: 24,
        iterations: 10000,
        salt: "pinkFluffyUnicornsDancingOnRainbows"
    };


    /**
     * Actually times how long it takes to compare data
     * through multiple loops.
     *
     * @param {string} dataHashed
     * @param {string} compareTo
     * @param {number} loops
     * @return {number}
     */
    function timeIt(dataHashed, compareTo, loops) {
        var endTime, i, startTime;

        startTime = process.hrtime();

        for (i = 0; i < loops; i += 1) {
            secureHash.compare(dataHashed, compareTo);
        }

        endTime = process.hrtime();

        return endTime[0] - startTime[0] + ((endTime[1] - startTime[1]) / 1000000000);
    };


    /**
     * Times multiple instances of the data to get times
     * for when we have the same data going in and
     * different data to track the difference and get a ratio
     * of the time to make sure it takes about the same time.
     *
     * @param {string} dataHashed
     * @param {string} compareTo
     * @param {number} loops
     */
    function startTiming(dataHashed, compareTo, loops) {
        var badTime, goodTime, ratio;

        goodTime = timeIt(dataHashed, compareTo, loops);

        // Need to set data to be bad so we get a bad compare time
        dataHashed[0] = 0x00;
        badTime = timeIt(dataHashed, compareTo, loops);
        ratio = badTime / goodTime;

        expect(ratio).toBeCloseTo(1, 0.1);
    }

    beforeEach(() => {
        var base64, promiseMock;

        crypto = require("crypto");
        promiseMock = require("./mock/promise-mock");
        base64 = require("../lib/base64");
        secureHash = require("../lib/secure-hash")(base64, crypto, promiseMock);
    });
    describe("secureHashAsync()", () => {
        it("hashes a passed in string", (done) => {
            secureHash.hashAsync("rRTcBER_EiFUsRa34Hj5Zpok", secureHashConfig).then((result) => {
                expect(result).toBe("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            }).then(done, done);
        });
        it("hashes a passed in buffer", (done) => {
            secureHash.hashAsync(new Buffer("rRTcBER_EiFUsRa34Hj5Zpok", "binary"), secureHashConfig).then((result) => {
                expect(result).toBe("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            }).then(done, done);
        });
        it("hashes without a config being passed in", (done) => {
            secureHash.hashAsync("rRTcBER_EiFUsRa34Hj5Zpok").then((result) => {
                expect(result).toBe("-IbPFNBgU7JvnlwV7IM_MR6Y9PaPd8gyJP7xZ_RzHjo0lcejcbWFgQcbXJJ2e9n1");
            }).then(done, done);
        });
        it("throws an error as there is nothing to hash", () => {
            expect(() => {
                secureHash.hashAsync("");
            }).toThrow();
        });
    });
    describe("secureHashCompareAsync()", () => {
        var compareTo, dataHashed, loops, mb;

        beforeEach(() => {
            mb = 1024 * 1024;
            loops = 50;

            /**
             * Filling up buffers with significant amout of data
             * to make the tests give resonable testable times.
             */
            dataHashed = new Buffer(mb);
            dataHashed.fill(0x42);
            compareTo = new Buffer(mb);
            compareTo.fill(0x42);

            // Warm up to make v8 for optimization
            timeIt(dataHashed, compareTo, loops);
        });
        it("compares successfully", () => {
            var result;

            result = secureHash.compare("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR", "9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            expect(result).toBe(true);
            startTiming(dataHashed, compareTo, loops);
        });
        it("compares and the lengths do not match", () => {
            var result;

            result = secureHash.compare("1dWoGpUg9c68gCGQQG4wKH", "9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            expect(result).toBe(false);

            /**
             * Want to test time with a hash that
             * isn't as long as the hash to compare to.
             */
            dataHashed = new Buffer(mb - 100);
            dataHashed.fill(0x42);
            startTiming(dataHashed, compareTo, loops);
        });
        it("compares the same length and the values do not match", () => {
            var result;

            result = secureHash.compare("9GnOLZ_xAlfMA4C6DHsjNJJpsShI_Tg5", "9GnOLZ_xAlfMA4C6DHsjNJJpsShI_TgR");
            expect(result).toBe(false);

            // Not testing time here as this scenario is timed already.
        });
    });
});