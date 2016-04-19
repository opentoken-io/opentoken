"use strict";

var TestPromise;

TestPromise = require("./test-promise");

module.exports = {
    /**
     * Resolves when all promises are resolved.
     *
     * Fulfilled value will be an array of the values from the array
     * of promises.  Rejects when any promise is rejected.
     *
     * @param {Array.<Promise>} promises
     * @return {Promise.<Array>}
     */
    all: function (promises) {
        var finalPromise, isDone, needed, result;

        function resolved(index, val) {
            if (isDone) {
                return;
            }

            result[index] = val;
            needed -= 1;

            if (!needed) {
                isDone = true;
                finalPromise.resolve(result);
            }
        }

        function rejected(val) {
            if (isDone) {
                return;
            }

            isDone = true;
            finalPromise.reject(val);
        }

        isDone = false;
        result = [];
        needed = promises.length;
        finalPromise = new TestPromise();
        promises.forEach((promise, key) => {
            promise.then(resolved.bind(null, key), rejected);
        });

        return finalPromise;
    },

    /**
     * Resolved when the first promise is resolved.  Rejected when the
     * first promise is rejected.
     *
     * @param {Array.<Promise>} promises
     * @return {Promise.<*>}
     */
    any: function (promises) {
        var finalPromise, isDone;

        function resolved(val) {
            if (isDone) {
                return;
            }

            isDone = true;
            finalPromise.resolve(val);
        }

        function rejected(val) {
            if (isDone) {
                return;
            }

            isDone = true;
            finalPromise.reject(val);
        }

        isDone = false;
        finalPromise = new TestPromise();
        promises.forEach((promise) => {
            promise.then(resolved, rejected);
        });

        return finalPromise;
    },


    /**
     * Creates a Promise using ES6 syntax
     *
     * @param {Function(resolve,reject)} cb
     * @return {Promise.<*>}
     */
    create: function (cb) {
        var promise;

        promise = new TestPromise();
        cb(promise.resolve.bind(promise), promise.reject.bind(promise));

        return promise;
    },


    /**
     * Provides a "done" callback to a function so you can wrap
     * Node-style callbacks and make them return promises.
     *
     * @param {Function(done)} fn
     * @return {Promise.<*>}
     */
    fromCallback: function (fn) {
        var promise;

        promise = new TestPromise();
        fn((err, val) => {
            if (err) {
                promise.reject(err);
            } else {
                promise.resolve(val);
            }
        });

        return promise;
    },


    /**
     * Changes one Node-style callback function into returning a Promise.
     *
     * @param {Function} fn
     * @return {Promise.<*>}
     */
    promisify: function (fn) {
        return function () {
            var args, promise;

            promise = new TestPromise();
            args = [].slice.call(arguments);
            args.push((err, val) => {
                if (err) {
                    promise.reject(err);
                } else {
                    promise.resolve(val);
                }
            });
            fn.apply(this, args);

            return promise;
        };
    },


    /**
     * Runs `promisify()` on all properties of an object, saving
     * the promised version of the method with "Async" appended.
     *
     * @param {Object} object
     * @return {Object}
     */
    promisifyAll: function (object) {
        var name, result;

        result = {};

        for (name in object) {
            result[name] = object[name];
            result[name + "Async"] = this.promisify(object[name]);
        }

        return result;
    },


    /**
     * Waits for all properties of an object to be resolved and then
     * resolves the promise with an object containing fulfilled values.
     * If any are rejected, the promise is rejected.
     *
     * @param {Object} obj
     * @return {Promise.<Object>}
     */
    props: function (obj) {
        var needed, promise, result;

        needed = 0;
        result = {};
        promise = new TestPromise();
        Object.keys(obj).forEach((key) => {
            var childPromise, val;

            needed += 1;
            val = obj[key];
            childPromise = new TestPromise();
            childPromise.resolve(val);
            childPromise.then((doneVal) => {
                needed -= 1;
                result[key] = doneVal;

                if (!needed) {
                    promise.resolve(result);
                }
            }, (err) => {
                promise.reject(err);
            });
        });

        return promise;
    },


    /**
     * Creates a rejected promise.
     *
     * @param {*} val
     * @return {Promise}
     */
    reject: function (val) {
        var promise;

        promise = new TestPromise();
        promise.reject(val);

        return promise;
    },


    /**
     * Creates a resolved promise.
     *
     * @param {*} val
     * @return {Promise.<*>}
     */
    resolve: function (val) {
        var promise;

        promise = new TestPromise();
        promise.resolve(val);

        return promise;
    },


    /**
     * Write your code in a synchronous way.  When anything throws an
     * exception, this rejects the generated promise.
     *
     * Old:
     *
     *   return promise.create((resolve, reject) => {
     *       try {
     *           resolve(thing());
     *       } catch (e) {
     *           reject(e);
     *       }
     *   });
     *
     * New:
     *
     *   return promise.try(() => {
     *       return thing();
     *   });
     *
     * @param {Function} fn
     * @return {Promise.<*>}
     */
    try: function (fn) {
        var promise, result;

        promise = new TestPromise();

        try {
            result = fn();
            promise.resolve(result);
        } catch (e) {
            promise.reject(e);
        }

        return promise;
    }
};
