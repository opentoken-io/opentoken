"use strict";

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
    var container, errorResponseMock, formatter, genericFormatterMock;

    if (!reqMock) {
        reqMock = require("../mock/request-mock")();
    }

    if (!resMock) {
        resMock = require("../mock/response-mock")();
    }

    container = require("../../lib/container");
    errorResponseMock = require("../mock/error-response-mock")();
    genericFormatterMock = require("../mock/formatter/generic-formatter-mock")();
    container.register("errorResponse", errorResponseMock);
    container.register("genericFormatter", genericFormatterMock);

    // This normally would return the thing we want.  In our case we don't
    // want the returned value, which would be a genericFormatter-wrapped
    // version of the formatter function.  Instead, we really want the
    // unwrapped version.  Calling `container.resolve()` will trigger the
    // necessary code and then we reach into our genericFormatterMock to
    // get the unwrapped formatter.
    container.resolve(formatterName);
    formatter = genericFormatterMock.formatWithFallback.mostRecentCall.args[0];

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
