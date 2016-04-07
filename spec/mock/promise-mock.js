"use strict";

var bluebird, mockPromises, realPromise;

bluebird = require("bluebird");
mockPromises = require("mock-promises");
realPromise = require("../../lib/promise.js");

module.exports = function () {
    mockPromises.install(bluebird);
    mockPromises.reset();

    return realPromise(bluebird);
};
