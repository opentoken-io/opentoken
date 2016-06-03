"use strict";

/**
 * Takes a bunch of middleware and converts it into a single function.
 *
 * You can call it with multiple arguments, arrays, arrays of arrays.
 * It straightens out the lot and chains it into a single function.
 */

/**
 * What is allowed
 *
 * @typedef {(Function|Array.<chainMiddleware~chain>)} chainMiddleware~chain
 */

module.exports = () => {
    /**
     * Converts the arguments that can each be functions or arrays
     * of functions or arrays of arrays of functions ... all of that
     * into a single array of functions to call.
     *
     * @param {chainMiddleware~chain} chain
     * @return {Array.<Function>}
     */
    function untangle(chain) {
        if (!Array.isArray(chain)) {
            return [
                chain
            ];
        }

        return chain.reduce((prev, link) => {
            return prev.concat(untangle(link));
        }, []);
    }


    /**
     * Makes a function that chains this middleware together properly.
     *
     * @param {chainMiddleware~chain} chains...
     * @return {Function}
     */
    return function () {
        var chains;

        chains = untangle([].slice.call(arguments));

        return (req, res, next) => {
            var index;

            /**
             * Replace the `next` call with this function.  It will
             * use the subsequent middleware in the chain.  When
             * done or when forcefully aborted, this calls the original
             * `next` function.
             *
             * @param {*} [x]
             */
            function nextInChain(x) {
                index += 1;

                // Check if we are quickly aborting or at the end
                /* eslint no-undefined:"off" */
                if (x !== undefined || !chains[index]) {
                    next(x);

                    return;
                }

                chains[index](req, res, nextInChain);
            }

            index = -1;
            nextInChain();
        };
    };
};
