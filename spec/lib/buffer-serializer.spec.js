"use strict";

describe("bufferSerializer", () => {
    var bufferSerializer, OtDate;

    beforeEach(() => {
        var container;

        container = require("../../lib/dependencies");
        OtDate = container.resolve("OtDate");
        bufferSerializer = container.resolve("bufferSerializer");
    });
    it("serializes something", () => {
        var result;

        result = bufferSerializer.toBuffer([
            null,
            "one",
            2,
            true
        ]);
        expect(bufferSerializer.fromBuffer(result)).toEqual([
            null,
            "one",
            2,
            true
        ]);
    });
    it("serializes OtDate", () => {
        var date, expected, result;

        date = OtDate.fromString("2012-01-02");
        result = bufferSerializer.toBuffer(date);
        expect(result).toEqual(jasmine.any(Buffer));

        //          V Z   O t D a t e T ..Date, no ms
        expected = "005A064F7444617465544F00F380";
        expect(result.toString("hex").toUpperCase()).toEqual(expected);
    });
    it("deserializes OtDate", () => {
        var date;

        date = bufferSerializer.fromBuffer(new Buffer("005A064F7444617465544F00F380", "hex"));
        expect(date).toEqual(jasmine.any(OtDate));
        expect(date.toString()).toEqual("2012-01-02T00:00:00.000Z");
    });
});
