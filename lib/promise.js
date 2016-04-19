"use strict";

module.exports = function (bluebird) {
    return {
        /**
         * Returns a promise when all promises passed in are resolved.
         *
         * @param {Array.<Promise>} promises
         * @return {Promise}
         */
        all: bluebird.all.bind(bluebird),


        /**
         * Returns a promise that is resolved when any promise is resolved.
         *
         * @param {Array.<Promise>} promises
         * @return {Promise}
         */
        any: bluebird.any.bind(bluebird),


        /**
         * Creates a new promise.
         *
         * @param {Function} callback(resolve, reject)
         * @return {Promise}
         */
        create: function (callback) {
            return new bluebird(callback);
        },


        /**
         * Generates a promise that can be fulfilled/rejected as a node
         * style callback.
         *
         * somePromise.then(function () {
         *     return promise.fromCallback(function (callback) {
         *         fs.readFile("some-file.txt", callback);
         *     });
         * });
         *
         * @param {Function} fn(callback)
         * @return {Promise}
         */
        fromCallback: bluebird.fromCallback.bind(bluebird),


        /**
         * Takes a node-style function and makes it return a promise.
         *
         * @param {Function} nodeFunctionWithCallback(..., callback)
         * @return {Promise}
         */
        promisify: bluebird.promisify.bind(bluebird),


        /**
         * Takes an object or library and promisifies all functions.
         * New promisified functions use "Async" at the end.
         *
         *     var fs = promise.promisifyAll(require("fs"));
         *     fs.readFileAsync("some-file.txt").then(...)
         *
         * @param {Object|Function} target Library object or class
         * @return {Object}
         */
        promisifyAll: bluebird.promisifyAll.bind(bluebird),


        /**
         * Returns a promise when all promises on an object are fulfilled.
         *
         * @param {Object} obj
         * @return {Promise}
         */
        props: bluebird.props.bind(bluebird),

        /**
         * Generates a rejected promise.
         *
         * @param {*} error
         * @return {Promise}
         */
        reject: bluebird.reject.bind(bluebird),


        /**
         * Generates a resolved promise.
         *
         * @param {*} data
         * @return {Promise}
         */
        resolve: bluebird.resolve.bind(bluebird),


        /**
         * Attempts to run synchronous code that may throw.  Starts a
         * promise chain.  The function can return a value and that will
         * be sent as the fulfillment value to the next promises.
         *
         * @param {Function} fn
         * @return {Promise}
         */
        try: bluebird.try.bind(bluebird)
    };
};
