/**
 * Configures the buffer serializer module to also handle OtDate objects.
 */
"use strict";

module.exports = (BufferSerializerModule, OtDate) => {
    var instance;

    instance = new BufferSerializerModule();
    instance.register("OtDate", (obj) => {
        return obj instanceof OtDate;
    }, (obj, buffWriter) => {
        return instance.toBufferInternal(obj.toDate(), buffWriter);
    }, (buffReader) => {
        var date;

        date = instance.fromBufferInternal(buffReader);

        return OtDate.fromDate(date);
    });

    return instance;
};
