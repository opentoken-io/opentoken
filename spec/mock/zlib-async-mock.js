"use strict";

var promiseMock, zlibAsyncMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
    zlibAsyncMock = jasmine.createSpyObj("zlibAsync", [
        "deflateRaw",
        "deflateRawAsync",
        "inflateRaw",
        "inflateRawAsync"
    ]);
    zlibAsyncMock.deflateRaw.andCallFake((data, callback) => {
        callback(null, new Buffer("compressed", "binary"));
    });
    zlibAsyncMock.deflateRawAsync.andCallFake(() => {
        return promiseMock.resolve(new Buffer("compressed", "binary"));
    });
    zlibAsyncMock.inflateRaw.andCallFake((data, callback) => {
        callback(null, new Buffer("decompressed", "binary"));
    });
    zlibAsyncMock.inflateRawAsync.andCallFake(() => {
        return promiseMock.resolve(new Buffer("decompressed", "binary"));
    });

    return zlibAsyncMock;
};
