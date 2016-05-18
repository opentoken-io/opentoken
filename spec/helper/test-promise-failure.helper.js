/**
 * This allows testing of a promise which is intented to fail.
 *
 * @param {Promise} promise
 * @param {string} errMessage
 * @param {Function} done
 */
jasmine.testPromiseFailure = function (promise, errMessage, done) {
    if (typeof errMessage === "function") {
        done = errMessage;
        errMessage = null;
    }

    return promise.then(function () {
        done(new Error("The promise should have been rejected"));
    }, function (err) {
        if (errMessage) {
            expect(err.toString()).toContain(errMessage);
        }

        done();
    });
};