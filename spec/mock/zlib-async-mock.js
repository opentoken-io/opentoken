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
        callback(null, new Buffer("compressed", "binary"));
    });
    zlibAsyncMock.deflateRawAsync.and.callFake(() => {
        return promiseMock.resolve(new Buffer("compressed", "binary"));
    });
    zlibAsyncMock.inflateRaw.and.callFake((data, callback) => {
        callback(null, new Buffer("decompressed", "binary"));
    });
    zlibAsyncMock.inflateRawAsync.and.callFake(() => {
        return promiseMock.resolve(new Buffer("decompressed", "binary"));
    });

    return zlibAsyncMock;
};
