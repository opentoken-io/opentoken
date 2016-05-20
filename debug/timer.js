"use strict";


/**
 * Shows the timing information stats with an optional prefix.
 *
 * @param {Object} stats Statistics to show (key/value pairs)
 * @param {string} [prefix] Prefix to add to the display of each key/value
 */
function show(stats, prefix) {
    if (prefix) {
        prefix += " ";
    } else {
        prefix = "";
    }

    Object.keys(stats).forEach((key) => {
        console.log(`${prefix}${key}:`, stats[key]);
    });
}


/**
 * Times a callback for a number of iterations.
 *
 * @param {Function} callback The function to execute
 * @param {number} iterations How many times to call it
 * @return {Object} stats The timing results, key/value pairs
 */
function time(callback, iterations) {
    var end, i, start, total;

    iterations = iterations || 1;
    start = process.hrtime();

    for (i = 0; i < iterations; i += 1) {
        callback();
    }

    end = process.hrtime();
    total = end[0] - start[0] + (end[1] - start[1]) / 1000000000;

    return {
        average: total / iterations,
        iterations,
        total
    };
}

module.exports = {
    /**
     * Combines the "time" and "run" functions.
     *
     * @param {Function} callback What to run
     * @param {number} iterations How many times to run it
     * @param {string} [prefix] The prefix to prepend when displaying stats
     */
    run(callback, iterations, prefix) {
        show(time(callback, iterations), prefix);
    },
    show,
    time
};
