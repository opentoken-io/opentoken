/**
 * Handles the promise fail.
 *
 * @param {string} actual
 * @param {string} expected
 * @param {Function} done
 */
jasmine.failAsync = function (actual, expected, done) {
    jasmine.fail(actual, expected);
    done();
};