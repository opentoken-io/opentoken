"use strict";

/**
 * This allows testing of a promise which is intended to fail.
 *
 * @param {Promise} promise
 * @param {string} errMessage
 * @param {Function} done
 * @return {Promise}
 */
jasmine.testPromiseFailure = function (promise, errMessage, done) {
    if (typeof errMessage === "function") {
        done = errMessage;
        errMessage = null;
    }

    return promise.then(() => {
        done(new Error("The promise should have been rejected"));
    }, (err) => {
        if (errMessage) {
            expect(err.toString()).toContain(errMessage);
        }

        done();
    });
};
