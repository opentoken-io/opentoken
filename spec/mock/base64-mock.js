"use strict";

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("base64", [
        "decode",
        "decodeForUri",
        "encode",
        "encodeForUri"
    ]);
    mock.decode.andCallFake((input) => {
        return new Buffer(input.toString("binary"), "base64").toString("binary");
    });
    mock.decodeForUri.andCallFake((input) => {
        input = input.toString("binary");
        input = input.replace(/_/g, "/").replace(/-/g, "+");
        input += "===".substr(input.length % 4 - 1);

        return new Buffer(input, "base64").toString("binary");
    });
    mock.encode.andCallFake((input) => {
        return new Buffer(input.toString("binary"), "binary").toString("base64");
    });
    mock.encodeForUri.andCallFake((input) => {
        return new Buffer(input.toString("binary"), "binary").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    });

    return mock;
};
