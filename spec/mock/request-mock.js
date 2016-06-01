"use strict";

module.exports = () => {
    return {
        href: jasmine.createSpy("request.href").andReturn("/path"),
        method: "GET"
    };
};
