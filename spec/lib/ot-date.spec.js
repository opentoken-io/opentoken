"use strict";

describe("OtDate", () => {
    var OtDate;

    /**
     * Compares a date against a string
     *
     * @param {Date} actual
     * @param {string} expected
     */
    function testDate(actual, expected) {
        expect(actual).toEqual(jasmine.any(Date));
        expect(actual.toISOString()).toEqual(expected);
    }


    /**
     * Compares an OtDate object against a string
     *
     * @param {OtDate} actual
     * @param {string} expected
     */
    function testOtDate(actual, expected) {
        expect(actual).toEqual(jasmine.any(OtDate));
        expect(actual.toString()).toEqual(expected);
    }

    beforeEach(() => {
        var moment;

        moment = require("moment");
        OtDate = require("../../lib/ot-date")(moment);
    });
    describe("fromDate() & toDate()", () => {
        it("gets an OtDate object back from a custom date/time", () => {
            var result;

            result = OtDate.fromDate(new Date("2016-04-16"));
            testOtDate(result, "2016-04-16T00:00:00.000Z");
            result = result.toDate();
            testDate(result, "2016-04-16T00:00:00.000Z");
        });
        it("throws an error for not getting passed a Date object", () => {
            expect(() => {
                OtDate.fromDate("2016-04-16");
            }).toThrow();
        });
    });
    describe("toBuffer() & fromBuffer()", () => {
        it("gets an OtDate object back from a buffer after creating as a buffer", () => {
            var result;

            result = OtDate.fromDate(new Date("2016-04-16")).toBuffer();
            expect(result).toEqual(jasmine.any(Buffer));
            expect(result.length).toBe(4);
            testOtDate(OtDate.fromBuffer(result), "2016-04-16T00:00:00.000Z");
        });
        it("gets an OtDate object back from a buffer at 1", () => {
            var b;

            b = Buffer.alloc(5);
            OtDate.fromDate(new Date("2016-04-16")).toBuffer(b, 1);
            testOtDate(OtDate.fromBuffer(b, 1), "2016-04-16T00:00:00.000Z");
        });
    });
    describe("fromString()", () => {
        it("passes in a date string", () => {
            testOtDate(OtDate.fromString("2016-04-16"), "2016-04-16T00:00:00.000Z");
        });
        it("passes in a date string with time", () => {
            testOtDate(OtDate.fromString("2016-04-16T03:00:00"), "2016-04-16T03:00:00.000Z");
        });
        it("passes in a date string with time and time zone converting to UTC", () => {
            testOtDate(OtDate.fromString("2016-04-16T03:00:00.000+0600"), "2016-04-15T21:00:00.000Z");
        });
        it("throws an error for not getting passed a Date object", () => {
            expect(() => {
                OtDate.fromString(new Date("2016-04-16"));
            }).toThrow();
        });
    });
    describe("isBefore()", () => {
        it("checks the date is before the set date", () => {
            expect(OtDate.fromDate(new Date("2016-04-17")).isBefore("2016-04-16")).toEqual(false);
        });
        it("checks the date is after the set date", () => {
            expect(OtDate.fromDate(new Date("2016-04-17")).isBefore("2016-04-19")).toEqual(true);
        });
        it("checks the date is after the set date and is a Date object", () => {
            expect(OtDate.fromDate(new Date("2016-04-16")).isBefore(new Date("2016-04-16"))).toEqual(false);
        });
        it("checks the date is after the set date and is an instance of OtDate", () => {
            var otherDate;

            otherDate = OtDate.fromString("2016-04-15");
            expect(OtDate.fromDate(new Date("2016-04-16")).isBefore(otherDate)).toEqual(false);
        });
    });
    describe("now()", () => {
        it("generates a time that represents 'now'", () => {
            var afterTime, beforeTime, result;

            beforeTime = new Date();
            result = OtDate.now().toDate();
            afterTime = new Date();

            // Test that the result is between beforeTime and afterTime
            expect(result).not.toBeLessThan(beforeTime);
            expect(result).not.toBeGreaterThan(afterTime);
        });
    });
    describe("plus()", () => {
        it("moves the current time to three hours ahead", () => {
            var result;

            result = OtDate.fromDate(new Date("2016-04-16 03:00:00Z")).plus({
                hours: 3
            });
            testOtDate(result, "2016-04-16T06:00:00.000Z");
        });
    });
    describe("toString()", () => {
        it("gets the formatted date/time back as a string", () => {
            var result;

            result = OtDate.fromDate(new Date("2016-04-16")).toString();
            expect(result).toEqual("2016-04-16T00:00:00.000Z");
        });
        it("gets the UTC date/time when passing in a local date/time", () => {
            var result;

            result = OtDate.fromDate(new Date("2016-04-16T14:00:00.000+0600")).toString();
            expect(result).toEqual("2016-04-16T08:00:00.000Z");
        });
        it("gets the UTC date/time when no timezone is set", () => {
            var d, result, time;

            time = Date.UTC(2016, 3, 16, 3, 0, 0);
            d = new Date();
            d.setTime(time);
            result = OtDate.fromDate(d).toString();
            expect(result).toEqual("2016-04-16T03:00:00.000Z");
        });
    });
    it("throws an error when calling class directly", () => {
        expect(() => {
            var otDate;

            otDate = new OtDate();
            otDate.toString();
        }).toThrow();
    });
});
