"use strict";

module.exports = () => {
    /**
     * Resolves when all promises are resolved.
     *
     * Fulfilled value will be an array of the values from the array
     * of promises.  Rejects when any promise is rejected.
     *
     * @param {Array.<Promise>} promises
     * @return {Promise.<Array>}
     */
    function all(promises) {
        return new Promise((resolver, rejecter) => {
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
                    resolver(result);
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
                rejecter(val);
            }

            isDone = false;
            result = [];
            needed = promises.length;
            promises.forEach((promise, key) => {
                promise.then(resolved.bind(null, key), rejected);
            });
        });
    }

    /**
     * Resolved when the first promise is resolved.  Rejected when the
     * first promise is rejected.
     *
     * @param {Array.<Promise>} promises
     * @return {Promise.<*>}
     */
    function any(promises) {
        return new Promise((resolver, rejecter) => {
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
                resolver(val);
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
                rejecter(val);
            }

            isDone = false;
            promises.forEach((promise) => {
                promise.then(resolved, rejected);
            });
        });
    }


    /**
     * Creates a Promise using ES6 syntax
     *
     * @param {Function} cb(resolve,reject)
     * @return {Promise.<*>}
     */
    function create(cb) {
        return new Promise(cb);
    }


    /**
     * Provides a "done" callback to a function so you can wrap
     * Node-style callbacks and make them return promises.
     *
     * @param {Function} fn(done)
     * @return {Promise.<*>}
     */
    function fromCallback(fn) {
        return new Promise((resolver, rejecter) => {
            fn((err, val) => {
                if (err) {
                    rejecter(err);
                } else {
                    resolver(val);
                }
            });
        });
    }


    /**
     * Changes one Node-style callback function into returning a Promise.
     *
     * @param {Function} fn
     * @param {Object} [context]
     * @return {Promise.<*>}
     */
    function promisify(fn, context) {
        // typeof null === "object", but that is ok here
        if (typeof context !== "object") {
            context = null;
        }

        return function () {
            var args;

            args = [].slice.call(arguments);

            return new Promise((resolver, rejecter) => {
                args.push((err, val) => {
                    if (err) {
                        rejecter(err);
                    } else {
                        resolver(val);
                    }
                });
                fn.apply(context, args);
            });
        };
    }


    /**
     * Runs `promisify()` on all properties of an object, saving
     * the promised version of the method with "Async" appended.
     *
     * @param {Object} object
     * @return {Object}
     */
    function promisifyAll(object) {
        var result;

        result = {};

        Object.getOwnPropertyNames(object).filter((name) => {
            var desc;

            desc = Object.getOwnPropertyDescriptor(object, name);

            if (!desc || desc.get || desc.set) {
                return false;
            }

            if (typeof object[name] !== "function") {
                return false;
            }

            return true;
        }).forEach((name) => {
            result[name] = object[name];
            result[`${name}Async`] = promisify(object[name], object);
        });

        return result;
    }


    /**
     * Waits for all properties of an object to be resolved and then
     * resolves the promise with an object containing fulfilled values.
     * If any are rejected, the promise is rejected.
     *
     * @param {Object} obj
     * @return {Promise.<Object>}
     */
    function props(obj) {
        return new Promise((resolver, rejecter) => {
            var needed, result;

            /**
             * Handles a successful resolution
             */
            function doneWithOne() {
                needed -= 1;

                if (!needed) {
                    resolver(result);
                }
            }

            // This is a fake number and is removed later.  It exists
            // in case the first promise is already resolved.
            needed = 1;
            result = {};
            Object.keys(obj).forEach((key) => {
                needed += 1;
                new Promise((childResolve) => {
                    childResolve(obj[key]);
                }).then((resolvedValue) => {
                    result[key] = resolvedValue;
                    doneWithOne();
                }, (rejectedValue) => {
                    // Force this to never call resolve();
                    needed = -1;
                    rejecter(rejectedValue);
                });
            });

            // This removes that fake number added earlier.
            doneWithOne();
        });
    }


    /**
     * Creates a rejected promise.
     *
     * @param {*} val
     * @return {Promise}
     */
    function reject(val) {
        return new Promise((resolver, rejecter) => {
            rejecter(val);
        });
    }


    /**
     * Creates a resolved promise.
     *
     * @param {*} val
     * @return {Promise.<*>}
     */
    function resolve(val) {
        return new Promise((resolver) => {
            resolver(val);
        });
    }


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
    function tryFn(fn) {
        return new Promise((resolver, rejecter) => {
            try {
                resolver(fn());
            } catch (e) {
                rejecter(e);
            }
        });
    }

    return {
        all: jasmine.createSpy("promise.all").and.callFake(all),
        any: jasmine.createSpy("promise.any").and.callFake(any),
        create: jasmine.createSpy("promise.create").and.callFake(create),
        fromCallback: jasmine.createSpy("promise.fromCallback").and.callFake(fromCallback),
        promisify: jasmine.createSpy("promise.promisify").and.callFake(promisify),
        promisifyAll: jasmine.createSpy("promise.promisify").and.callFake(promisifyAll),
        props: jasmine.createSpy("promise.props").and.callFake(props),
        reject: jasmine.createSpy("promise.reject").and.callFake(reject),
        resolve: jasmine.createSpy("promise.resolve").and.callFake(resolve),
        try: jasmine.createSpy("promise.try").and.callFake(tryFn)
    };
};
