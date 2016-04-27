jasmine.failAsync = function (done, actual, expected) {
    jasmine.fail(actual, expected);
    done();
};