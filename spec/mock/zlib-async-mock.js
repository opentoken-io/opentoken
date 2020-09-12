"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    var zlibAsyncMock;

    zlibAsyncMock = jasmine.createSpyObj("zlibAsync", [
        "deflateRaw",
        "deflateRawAsync",
        "inflateRaw",
        "inflateRawAsync"
    ]);
    zlibAsyncMock.deflateRaw.and.callFake((data, callback) => {
        callback(null, Buffer.from("compressed", "binary"));
    });
    zlibAsyncMock.deflateRawAsync.and.callFake(() => {
        return promiseMock.resolve(Buffer.from("compressed", "binary"));
    });
    zlibAsyncMock.inflateRaw.and.callFake((data, callback) => {
        callback(null, Buffer.from("decompressed", "binary"));
    });
    zlibAsyncMock.inflateRawAsync.and.callFake(() => {
        return promiseMock.resolve(Buffer.from("decompressed", "binary"));
    });

    return zlibAsyncMock;
};
