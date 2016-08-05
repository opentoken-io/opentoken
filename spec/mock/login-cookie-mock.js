"use strict";

module.exports = () => {
    var spyObj;

    spyObj = jasmine.createSpyObj("loginCookieMock", [
        "clear",
        "get",
        "refresh",
        "set"
    ]);

    return spyObj;
};
