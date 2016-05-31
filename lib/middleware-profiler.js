"use strict";

/**
 * @typedef {Array.<number>} middlewareProfiler~hrtime
 */

module.exports = (setIntervalFn) => {
    /**
     * Monkey patches a server to enable profiling of middleware.  Does not
     * profile middleware that was already added to the server.
     *
     * It only tests middleware that executes successfully.  Anything that
     * throws will be lost.
     *
     * @return {Function}
     */
    class MiddlewareProfiler {
        /**
         * Build the profiler
         */
        constructor() {
            this.profiles = {};
        }


        /**
         * Starts an interval that will display the results to a logger
         *
         * @param {Function} callback
         * @param {number} interval
         * @return {*} interval identifier
         */
        displayAtInterval(callback, interval) {
            return setIntervalFn(() => {
                callback(this.toString());
            }, interval);
        }


        /**
         * Returns the profile information.
         *
         * Note:  This structure's format is not fixed and may change in the
         * future.
         *
         * @return {Object}
         */
        getProfiles() {
            return this.profiles;
        }


        /**
         * This does the actual patching of server.use to wrap the middleware
         * in a timing function.
         *
         * @param {Restify} server
         */
        profileServer(server) {
            var original, profiles;

            original = server.use;

            // Copy to local variable to access it in the next function
            profiles = this.profiles;

            /**
             * This is the patched `use` method.  It's context is the server
             * object, not middlewareProfiler.
             *
             * @param {string} [route]
             * @param {Function} fn
             * @return {*} Whatever the original `use()` returns.
             */
            server.use = function (route, fn) {
                var args, cumulative, logName;

                /**
                 * Adds a bit more time to the cumulative time.
                 *
                 * @param {middlewareProfiler~hrtime} startTime
                 * @param {middlewareProfiler~hrtime} endTime
                 */
                function addElapsed(startTime, endTime) {
                    var elapsed;

                    elapsed = endTime[0] - startTime[0] + (endTime[1] - startTime[1]) / 1000000000;
                    cumulative.elapsed += elapsed;
                    cumulative.hits += 1;
                }

                /**
                 * Replaces the "next" or "done" callback.  Starts the timer
                 * and calls a function.  When it is done, stops the timer
                 * and continues execution.
                 *
                 * @param {Object} req Request
                 * @param {Object} res Response
                 * @param {Function} next
                 * @return {*} Whatever is returned from the real middleware
                 */
                function finished(req, res, next) {
                    var startTime;

                    startTime = process.hrtime();

                    return fn(req, res, (val) => {
                        addElapsed(startTime, process.hrtime());

                        return next(val);
                    });
                }

                if (typeof route === "function") {
                    // "route" is really a function
                    fn = route;
                    route = null;
                    args = [
                        finished
                    ];
                } else {
                    args = [
                        route,
                        finished
                    ];
                }

                logName = fn.name.toString();

                while (profiles[logName]) {
                    logName += "_";
                }

                profiles[logName] = cumulative = {
                    hits: 0,
                    elapsed: 0
                };

                return original.apply(this, args);
            };
        }


        /**
         * Converts stats to a textual representation
         *
         * @return {string}
         */
        toString() {
            var lines;

            lines = [];
            Object.keys(this.profiles).forEach((name) => {
                lines.push([
                    name,
                    `${this.profiles[name].hits} hits`,
                    `${Math.round(this.profiles[name].elapsed * 1000)} ms`,
                    `${Math.round(1000 * this.profiles[name].elapsed / this.profiles[name].hits)} avg`
                ].join(", "));
            });

            return lines.join("\n");
        }
    }

    return MiddlewareProfiler;
};
