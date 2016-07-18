"use strict";

var prototype;

/**
 * Wrap what is passed into one of the global functions in order to handle
 * promises.
 *
 * @param {number} parameterIndex
 * @param {Function} original The original global function
 * @return {Function} what should replace the global function
 */
function handlePromise(parameterIndex, original) {
    return function () {
        var args, callback;

        args = [].slice.call(arguments);
        callback = args[parameterIndex];

        // Only handle promises if the original callback does not.
        if (!callback.length) {
            args[parameterIndex] = function (done) {
                var result;

                result = callback();

                if (result && result.then && typeof result.then === "function") {
                    result.then(done, done);
                } else {
                    done();
                }
            };
        }

        /* eslint no-invalid-this:"off" */
        original.apply(this, args);
    };
}

prototype = jasmine.Env.prototype;

if (!prototype.patchedForPromises) {
    prototype.patchedForPromises = true;
    prototype.afterEach = handlePromise(0, prototype.afterEach);
    prototype.beforeEach = handlePromise(0, prototype.beforeEach);
    prototype.iit = handlePromise(1, prototype.iit);
    prototype.it = handlePromise(1, prototype.it);
    prototype.xit = handlePromise(1, prototype.xit);
}
