"use strict";

describe("OtDate", () => {
    var otDate;

    function testDate(actual, expected) {
        expect(actual).toEqual(jasmine.any(Date));
        expect(actual.toISOString()).toEqual(expected);
    }

    function testOtDate(actual, expected) {
        expect(actual).toEqual(jasmine.any(otDate));
        expect(actual.toString()).toEqual(expected);
    }

    beforeEach(() => {
        var moment;

        moment = require("moment");
        otDate = require("../lib/ot-date")(moment);
    });
    describe("fromDate() & toDate()", () => {
        it("gets an OtDate object back from a custom date/time", () => {
            var result;

            result = otDate.fromDate(new Date("2016-04-16"));
            testOtDate(result, "2016-04-16T00:00:00.000Z");
            result = result.toDate();
            testDate(result, "2016-04-16T00:00:00.000Z");
        });
        it("throws an error for not getting passed a Date object", () => {
            expect(() => {
                otDate.fromDate("2016-04-16");
            }).toThrow();
        });
    });
    describe("toBuffer() & fromBuffer()", () => {
        it("gets an OtDate object back from a buffer after creating as a buffer", () => {
            var result;

            result = otDate.fromDate(new Date("2016-04-16")).toBuffer();
            expect(result).toEqual(jasmine.any(Buffer));
            expect(result.length).toBe(4);
            testOtDate(otDate.fromBuffer(result), "2016-04-16T00:00:00.000Z");
        });
        it("gets an OtDate object back from a buffer at 1", () => {
            var b;

            b = new Buffer(5);
            otDate.fromDate(new Date("2016-04-16")).toBuffer(b, 1);
            testOtDate(otDate.fromBuffer(b, 1), "2016-04-16T00:00:00.000Z");
        });
    });
    describe("fromString()", () => {
        it("passes in a date string", () => {
            testOtDate(otDate.fromString("2016-04-16"), "2016-04-16T00:00:00.000Z");
        });
        it("passes in a date string with time", () => {
            testOtDate(otDate.fromString("2016-04-16T03:00:00"), "2016-04-16T03:00:00.000Z");
        });
        it("passes in a date string with time and time zone converting to UTC", () => {
            testOtDate(otDate.fromString("2016-04-16T03:00:00.000+0600"), "2016-04-15T21:00:00.000Z");
        });
        it("throws an error for not getting passed a Date object", () => {
            expect(() => {
                otDate.fromString(new Date("2016-04-16"));
            }).toThrow();
        });
    });
    describe("isBefore()", () => {
        it("checks the date is before the set date", () => {
            expect(otDate.fromDate(new Date("2016-04-17")).isBefore("2016-04-16")).toEqual(false);
        });
        it("checks the date is after the set date", () => {
            expect(otDate.fromDate(new Date("2016-04-17")).isBefore("2016-04-19")).toEqual(true);
        });
        it("checks the date is after the set date and is a Date object", () => {
            expect(otDate.fromDate(new Date("2016-04-16")).isBefore(new Date("2016-04-16"))).toEqual(false);
        });
        it("checks the date is after the set date and is an instance of OtDate", () => {
            var otherDate;

            otherDate = otDate.fromString("2016-04-15");
            expect(otDate.fromDate(new Date("2016-04-16")).isBefore(otherDate)).toEqual(false);
        });
    });
    describe("now()", () => {
        it("generates a time that represents 'now'", () => {
            var afterTime, beforeTime, result;

            beforeTime = new Date();
            result = otDate.now().toDate();
            afterTime = new Date();

            // Test that the result is between beforeTime and afterTime
            expect(result).not.toBeLessThan(beforeTime);
            expect(result).not.toBeGreaterThan(afterTime);
        });
    });
    describe("plus()", () => {
        it("moves the current time to three hours ahead", () => {
            var result;

            result = otDate.fromDate(new Date("2016-04-16 03:00:00")).plus({
                hours: 3
            });
            testOtDate(result, "2016-04-16T06:00:00.000Z");
        });
    });
    describe("toString()", () => {
        it("gets the formatted date/time back as a string", () => {
            var result;

            result = otDate.fromDate(new Date("2016-04-16")).toString();
            expect(result).toEqual("2016-04-16T00:00:00.000Z");
        });
        it("gets the UTC date/time when passing in a local date/time", () => {
            var result;

            result = otDate.fromDate(new Date("2016-04-16T14:00:00.000+0600")).toString();
            expect(result).toEqual("2016-04-16T08:00:00.000Z");
        });
        it("gets the UTC date/time when no timezone is set", () => {
            var result;

            result = otDate.fromDate(new Date("2016-04-16T03:00:00.000")).toString();
            expect(result).toEqual("2016-04-16T03:00:00.000Z");
        });
    });
    it("throws an error when calling class directly", () => {
        expect(() => {
            new otDate();
        }).toThrow();
    });
});