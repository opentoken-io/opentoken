"use strict";

/*global Promise*/
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
        return new Promise((resolve, reject) => {
            var isDone, needed, result;

            function resolved(index, val) {
                if (isDone) {
                    return;
                }

                result[index] = val;
                needed -= 1;

                if (!needed) {
                    isDone = true;
                    resolve(result);
                }
            }

            function rejected(val) {
                if (isDone) {
                    return;
                }

                isDone = true;
                reject(val);
            }

            isDone = false;
            result = [];
            needed = promises.length;
            promises.forEach((promise, key) => {
                promise.then(resolved.bind(null, key), rejected);
            });
        });
    },

    /**
     * Resolved when the first promise is resolved.  Rejected when the
     * first promise is rejected.
     *
     * @param {Array.<Promise>} promises
     * @return {Promise.<*>}
     */
    any: function (promises) {
        return new Promise((resolve, reject) => {
            var isDone;

            function resolved(val) {
                if (isDone) {
                    return;
                }

                isDone = true;
                resolve(val);
            }

            function rejected(val) {
                if (isDone) {
                    return;
                }

                isDone = true;
                reject(val);
            }

            isDone = false;
            promises.forEach((promise) => {
                promise.then(resolved, rejected);
            });
        });
    },


    /**
     * Creates a Promise using ES6 syntax
     *
     * @param {Function(resolve,reject)} cb
     * @return {Promise.<*>}
     */
    create: function (cb) {
        return new Promise(cb);
    },


    /**
     * Provides a "done" callback to a function so you can wrap
     * Node-style callbacks and make them return promises.
     *
     * @param {Function(done)} fn
     * @return {Promise.<*>}
     */
    fromCallback: function (fn) {
        return new Promise((resolve, reject) => {
            fn((err, val) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(val);
                }
            });
        });
    },


    /**
     * Changes one Node-style callback function into returning a Promise.
     *
     * @param {Function} fn
     * @return {Promise.<*>}
     */
    promisify: function (fn) {
        return function () {
            var args;

            args = [].slice.call(arguments);

            return new Promise((resolve, reject) => {
                args.push((err, val) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(val);
                    }
                });
                fn.apply(this, args);
            });
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
        return new Promise((resolve, reject) => {
            var needed, result;

            function doneWithOne() {
                needed -= 1;

                if (!needed) {
                    resolve(result);
                }
            }

            needed = 1; // Fake number, removed later
            result = {};
            Object.keys(obj).forEach((key) => {
                needed += 1;
                (new Promise((childResolve) => {
                    childResolve(obj[key]);
                })).then((resolvedValue) => {
                    result[key] = resolvedValue;
                    doneWithOne();
                }, (rejectedValue) => {
                    needed = -1;  // Force this to never call resolve();
                    reject(rejectedValue);
                });
            });

            doneWithOne();
        });
    },


    /**
     * Creates a rejected promise.
     *
     * @param {*} val
     * @return {Promise}
     */
    reject: function (val) {
        return new Promise((resolve, reject) => {
            reject(val);
        });
    },


    /**
     * Creates a resolved promise.
     *
     * @param {*} val
     * @return {Promise.<*>}
     */
    resolve: function (val) {
        return new Promise((resolve) => {
            resolve(val);
        });
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
        return new Promise((resolve, reject) => {
            try {
                resolve(fn());
            } catch (e) {
                reject(e);
            }
        });
    }
};
