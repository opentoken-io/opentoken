"use strict";

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("genericFormatterMock", [
        "formatWithFallback"
    ]);

    return mock;
};
