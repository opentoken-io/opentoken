"use strict";

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("binaryBufferMock", [
        "toBuffer",
        "toString"
    ]);

    mock.toBuffer.andCallFake((params) => {
        return new Buffer(params, "binary");
    });

    mock.toString.andCallFake((params) => {
        return params.toString();
    });

    return mock;
};
