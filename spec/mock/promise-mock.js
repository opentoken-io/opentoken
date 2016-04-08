"use strict";

var TestPromise;

TestPromise = require("./test-promise");

module.exports = {
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
    create: function (cb) {
        var promise;

        promise = new TestPromise();
        cb(promise.resolve.bind(promise), promise.reject.bind(promise));

        return promise;
    },
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
    promisifyAll: function (object) {
        var name, result;

        result = {};

        for (name in object) {
            result[name] = object[name];
            result[name + "Async"] = this.promisify(object[name]);
        }

        return result;
    },
    reject: function (val) {
        var promise;

        promise = new TestPromise();
        promise.reject(val);

        return promise;
    },
    resolve: function (val) {
        var promise;

        promise = new TestPromise();
        promise.resolve(val);

        return promise;
    }
};
