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
        it("returns date", () => {
            expect(OtDate.fromDate("2016-04-16")).toEqual(jasmine.any(OtDate));
        });
    });
    describe("fromBuffer()", () => {
        it("returns date", () => {
            var b;

            b = new Buffer(4);
            b.writeUInt32LE("2016-04-16", 0);

            expect(OtDate.fromBuffer(b)).toEqual(jasmine.any(OtDate));
        });
    });
    describe("isBefore()", () => {
        it("returns true", () => {
            expect(OtDate.now().isBefore("2016-04-16")).toEqual(true);
        });
    });
    describe("now()", () => {
        it("gets the current date", () => {
            var anotherTime, currentTime, result;

            currentTime = new Date();
            result = OtDate.now();
            anotherTime = new Date();

            expect(result).toEqual(jasmine.any(OtDate));
        });
    });
    describe("plus()", () => {
        it("returns a moment object", () => {
            var result;

            result = OtDate.now().plus({
                hours: 3
            });

            expect(result).toEqual(jasmine.any(Object));
        });
    });
    describe("toBuffer()", () => {
        it("returns a string", () => {
            expect(OtDate.now().toBuffer()).toEqual(jasmine.any(Buffer));
        });
    });
    describe("toDate()", () => {
        it("returns a moment object", () => {
            expect(OtDate.now().toDate()).toEqual(jasmine.any(Object));
        });
    });
    describe("toString()", () => {
        it("returns a string", () => {
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