/* eslint guard-for-in:"off" */

"use strict";

/* global Promise*/
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
    all(promises) {
        return new Promise((resolve, reject) => {
            var isDone, needed, result;

            /**
             * Handle a resolved promise
             *
             * @param {number} index
             * @param {*} val
             */
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

            /**
             * Handle a rejected promise
             *
             * @param {*} val
             */
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
    any(promises) {
        return new Promise((resolve, reject) => {
            var isDone;

            /**
             * Handle a resolved promise
             *
             * @param {*} val
             */
            function resolved(val) {
                if (isDone) {
                    return;
                }

                isDone = true;
                resolve(val);
            }

            /**
             * Handle a rejected promise
             *
             * @param {*} val
             */
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
     * @param {Function} cb(resolve,reject)
     * @return {Promise.<*>}
     */
    create(cb) {
        return new Promise(cb);
    },


    /**
     * Provides a "done" callback to a function so you can wrap
     * Node-style callbacks and make them return promises.
     *
     * @param {Function} fn(done)
     * @return {Promise.<*>}
     */
    fromCallback(fn) {
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
    promisify(fn) {
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
                fn.apply(null, args);
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
    promisifyAll(object) {
        var result;

        result = {};

        Object.keys(object).forEach((name) => {
            result[name] = object[name];
            result[`${name}Async`] = this.promisify(object[name]);
        });

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
    props(obj) {
        return new Promise((resolve, reject) => {
            var needed, result;

            /**
             * Handles a successful resolution
             */
            function doneWithOne() {
                needed -= 1;

                if (!needed) {
                    resolve(result);
                }
            }

            // This is a fake number and is removed later.  It exists
            // in case the first promise is already resolved.
            needed = 1;
            result = {};
            Object.keys(obj).forEach((key) => {
                needed += 1;
                (new Promise((childResolve) => {
                    childResolve(obj[key]);
                })).then((resolvedValue) => {
                    result[key] = resolvedValue;
                    doneWithOne();
                }, (rejectedValue) => {
                    // Force this to never call resolve();
                    needed = -1;
                    reject(rejectedValue);
                });
            });

            // This removes that fake number added earlier.
            doneWithOne();
        });
    },


    /**
     * Creates a rejected promise.
     *
     * @param {*} val
     * @return {Promise}
     */
    reject(val) {
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
    resolve(val) {
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
    try(fn) {
        return new Promise((resolve, reject) => {
            try {
                resolve(fn());
            } catch (e) {
                reject(e);
            }
        });
    }
};
