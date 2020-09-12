"use strict";

describe("bufferSerializer", () => {
    var bufferSerializer, OtDate;

    beforeEach(() => {
        var bufferSerializerModule, moment;

        moment = require("moment");
        OtDate = require("../../lib/ot-date")(moment);
        bufferSerializerModule = require("buffer-serializer");
        bufferSerializer = require("../../lib/buffer-serializer")(bufferSerializerModule, OtDate);
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

        date = bufferSerializer.fromBuffer(Buffer.from("005A064F7444617465544F00F380", "hex"));
        expect(date).toEqual(jasmine.any(OtDate));
        expect(date.toString()).toEqual("2012-01-02T00:00:00.000Z");
    });
});
