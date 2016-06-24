/**
 * Configures the buffer serializer module to also handle OtDate objects.
 */
"use strict";

module.exports = (bufferSerializerModule, OtDate) => {
    bufferSerializerModule.register("OtDate", (obj) => {
        return obj instanceof OtDate;
    }, (obj, buffWriter) => {
        return bufferSerializerModule.toBufferInternal(obj.toDate(), buffWriter);
    }, (buffReader) => {
        var date;

        date = bufferSerializerModule.fromBufferInternal(buffReader);

        return OtDate.fromDate(date);
    });

    return bufferSerializerModule;
};
