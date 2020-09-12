"use strict";

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("binaryBufferMock", [
        "toBuffer",
        "toString"
    ]);

    mock.toBuffer.and.callFake((params) => {
        return Buffer.from(params, "binary");
    });

    mock.toString.and.callFake((params) => {
        return params.toString("binary");
    });

    return mock;
};
