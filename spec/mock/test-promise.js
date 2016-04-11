"use strict";

/**
 * This is a promise that helps with testing.  It isn't A+ compliant but it
 * will be more than adequate for getting you through complex tests.
 *
 * - `.then()` is a spy
 * - Newly generated promises are TestPromise instances
 * - There's a method on the instance to get its current internal state
 * - Synchronous resolution to avoid setTimeout() and wait() calls
 */

/**
 * Utility to determine if an argument qualifies as a promise
 *
 * @param {*} promise
 * @return {boolean}
 */
function isPromise(promise) {
    return promise && promise.then && typeof promise.then === "function";
}


/**
 * Test promise that lets you get information about the internal state.
 */
class TestPromise {
    /***
     * Constructor
     *
     * @param {Promise} [parentPromise] Attach immediately to this parent
     */
    constructor(parentPromise) {
        // These are internal - use methods on the prototype instead
        this.callbackSets = [];
        this.success = null;
        this.value = undefined;
        spyOn(this, "then").andCallThrough();

        if (isPromise(parentPromise)) {
            this.attachTo(parentPromise);
        }
    }


    /**
     * Attaches the result of this promise to the resolution of a
     * different promise.
     *
     * @param {Promise} parentPromise
     */
    attachTo(parentPromise) {
        parentPromise.then(this.resolve.bind(this), this.reject.bind(this));
    }


    /**
     * Calls all of the callbacks registered for this promise.
     */
    callAllCallbacks() {
        this.callbackSets.forEach((set) => {
            this.callCallbackSet(set);
        });
    }


    /**
     * An object tracking the callbacks and associated promise for a
     * single call to `.then()`.
     *
     * @typedef {Object} TestPromise~callbackSet
     * @param {?Function} failure
     * @param {TestPromise} promise
     * @param {?Function} success
     */

    /**
     * Calls a single callback (success or error) and pass it the value
     * of this promise.
     *
     * @param {TestPromise~callbackSet} set
     */
    callCallbackSet(set) {
        var callback, result;

        if (this.success) {
            callback = set.success;
        } else {
            callback = set.failure;
        }

        try {
            if (callback) {
                result = callback(this.value);
                set.promise.resolve(result);
            } else {
                if (this.success) {
                    set.promise.resolve(this.value);
                } else {
                    set.promise.reject(this.value);
                }
            }
        } catch (err) {
            set.promise.reject(err);
        }
    }


    /**
     * Return all child promises attached to this promise
     *
     * @return {Array.<TestPromise>}
     */
    children() {
        return this.callbackSets.map(function (set) {
            return set.promise;
        });
    }


    /**
     * Reject the promise
     *
     * @param {*} value
     */
    reject(value) {
        if (this.success !== null) {
            return;
        }

        this.value = value;
        this.success = false;
        this.callAllCallbacks();
    }


    /**
     * Resolve the promise.  When resolved with a Promise, this will instead
     * attach to the other promise.
     *
     * @param {*} value
     */
    resolve(value) {
        if (this.success !== null) {
            return;
        }

        // When resolving with a promise, just attach to it instead
        if (isPromise(value)) {
            this.attachTo(value);
        } else {
            this.value = value;
            this.success = true;
            this.callAllCallbacks();
        }
    }

    /**
     * Returns either `null` for an unfulfilled promise or an object that has
     * `success` and `value` properties.
     *
     * @return {?Object}
     */
    status() {
        if (this.success !== null) {
            return {
                success: this.success,
                value: this.value
            };
        }

        return null;
    }


    /**
     * Attach success and failure callbacks to this promise
     *
     * @param {?Function} success
     * @param {?Function} failure
     * @return {TestPromise}
     */
    then(success, failure) {
        var callbackSet;

        callbackSet = {
            failure: failure,
            promise: new TestPromise(),
            success: success
        };
        this.callbackSets.push(callbackSet);

        if (this.success !== null) {
            this.callCallbackSet(callbackSet);
        }

        return callbackSet.promise;
    }
}

module.exports = TestPromise;
