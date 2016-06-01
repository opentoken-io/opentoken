"use strict";

module.exports = () => {
    return {
        get: jasmine.createSpy("server.get")
    };
};
