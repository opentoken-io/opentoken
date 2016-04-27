jasmine.testPromiseFailure = function (promise, errMessage, done) {
    if (typeof errMessage === "function") {
        done = errMessage;
        errMessage = null;
    }

    return promise.then(function () {
        jasmine.failAsync(done, "the promise", "rejected");
    }, function (err) {
        if (errMessage) {
            expect(err.toString()).toContain(errMessage);
        }
        done();
    });
};