"use strict";


/**
 * Shows the timing information stats with an optional prefix.
 *
 * @param {Object} stats
 * @param {string} [prefix]
 */
function show(stats, prefix) {
    if (prefix) {
        prefix += " ";
    } else {
        prefix = "";
    }

    Object.keys(stats).forEach((key) => {
        console.log(prefix + key + ":", stats[key]);
    });
}


/**
 * Times a callback for a number of iterations.
 *
 * @param {Function} callback
 * @param {number} iterations
 * @return {Object} stats
 */
function time(callback, iterations) {
    var elapsed, end, i, start;

    iterations = iterations || 1;
    start = process.hrtime();

    for (i = 0; i < iterations; i += 1) {
        callback();
    }

    end = process.hrtime();
    elapsed = (end[0] - start[0]) + (end[1] - start[1]) / 1000000000;

    return {
        average: elapsed / iterations,
        iterations: iterations,
        total: elapsed
    };
}

module.exports = {
    /**
     * Combines the "time" and "run" functions.
     *
     * @param {Function} callback
     * @param {number} iterations
     * @param {string} [prefix]
     */
    run: function (callback, iterations, prefix) {
        show(time(callback, iterations), prefix);
    },
    show: show,
    time: time
}
