"use strict";

describe("OtDate", () => {
    var OtDate, MomentFake;

    beforeEach(() => {
        class MomentFake {
            constructor() {
                [
                    "add",
                    "fromString",
                    "toDate",
                    "utc",
                    "unix"
                ].forEach((method) => {
                    this[method] = jasmine.createSpy(method);
                    this[method].andCallFake(() => {
                        return this;
                    });
                });
                this.isBefore = jasmine.createSpy("isBefore");
                this.isBefore.andCallFake((date) => {
                    return true;
                });
                this.toString = jasmine.createSpy("toString");
                this.toString.andCallFake(() => {
                    return "a formatted date";
                });
            }
        };
        OtDate = require("../lib/ot-date")(MomentFake);
    });
    describe("fromDate()", () => {
        it("gets an OtDate object back from a custom date/time", () => {
            expect(OtDate.fromDate("2016-04-16")).toEqual(jasmine.any(OtDate));
        });
    });
    describe("fromBuffer()", () => {
        it("gets an OtDate object back from a buffer object", () => {
            var b;

            b = new Buffer(4);
            b.writeUInt32LE("2016-04-16", 0);

            expect(OtDate.fromBuffer(b)).toEqual(jasmine.any(OtDate));
        });
    });
    describe("isBefore()", () => {
        it("checks the date is before the set date", () => {
            expect(OtDate.fromDate("2016-04-17").isBefore("2016-04-16")).toEqual(true);
        });
    });
    describe("now()", () => {
        it("gets the OtDate object back", () => {
            var anotherTime, currentTime, result;

            currentTime = new Date();
            result = OtDate.now();
            anotherTime = new Date();
            expect(result).toEqual(jasmine.any(OtDate));
        });
    });
    describe("plus()", () => {
        it("sets the current time to three hours ahead", () => {
            var result;

            result = OtDate.now().plus({
                hours: 3
            });

            expect(result).toEqual(jasmine.any(Object));
        });
    });
    describe("toBuffer()", () => {
        it("makes the current date/time a buffer object", () => {
            expect(OtDate.now().toBuffer()).toEqual(jasmine.any(Buffer));
        });
    });
    describe("toDate()", () => {
        it("gets the current time as a date time object", () => {
            expect(OtDate.now().toDate()).toEqual(jasmine.any(Object));
        });
    });
    describe("toString()", () => {
        it("gets the formatted date back as a string", () => {
            var result;

            result = OtDate.now().toString();

            expect(result).toEqual(jasmine.any(String));
            expect(result).toBe("a formatted date");
        });
    });
    it("throws an error when calling class directly", () => {
        expect(() => {
            new OtDate();
        }).toThrow();
    });
});