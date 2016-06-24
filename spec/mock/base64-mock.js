"use strict";

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("base64", [
        "encode",
        "encodeForUri"
    ]);
    mock.encode.andCallFake((input) => {
        return new Buffer(input.toString("binary"), "binary").toString("base64");
    });
    mock.encodeForUri.andCallFake((input) => {
        return new Buffer(input.toString("binary"), "binary").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    });

    return mock;
};
