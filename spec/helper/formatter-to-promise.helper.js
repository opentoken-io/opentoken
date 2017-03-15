"use strict";

var mockRequire;

mockRequire = require("mock-require");

/**
 * Load an OpenToken-style formatter and wrap it in a Promise to make
 * testing easier.  This promise is *REJECTED* if the middleware calls
 * the callback with any error or if the middleware throws.  The promise
 * is resolved with the modified body when there is no error.
 *
 * @param {string} formatterName
 * @param {Object} [reqMock] Request mock (one is generated if not specified)
 * @param {Object} [resMock] Response mock (one is generated if not specified)
 * @return {Promise.<Function>} A Promised middleware accepting (req,res)
 */
jasmine.formatterToPromise = (formatterName, reqMock, resMock) => {
    var container, formatter, genericFormatterMock;

    if (!reqMock) {
        reqMock = require("../mock/request-mock")();
    }

    if (!resMock) {
        resMock = require("../mock/response-mock")();
    }

    // Get a fresh copy of the container
    container = mockRequire.reRequire("../../lib/container");
    genericFormatterMock = require("../mock/formatter/generic-formatter-mock")();
    container.register("genericFormatter", genericFormatterMock);

    // This normally would return the thing we want.  In our case we don't
    // want the returned value, which would be a genericFormatter-wrapped
    // version of the formatter function.  Instead, we really want the
    // unwrapped version.  Calling `container.resolve()` will trigger the
    // necessary code and then we reach into our genericFormatterMock to
    // get the unwrapped formatter.
    container.resolve(formatterName);
    formatter = genericFormatterMock.formatWithFallback.calls.mostRecent().args[0];

    // Because the container was corrupt, we now erase the corrupted
    // container from the require cache.
    mockRequire.reRequire("../../lib/container");

    return (body) => {
        return new Promise((resolve, reject) => {
            formatter(reqMock, resMock, body, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    };
};
