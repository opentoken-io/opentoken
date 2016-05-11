"use strict";

/**
 * Checks the option passed in has a 
 * beginning slash and and ending slash.
 *
 * @param {string} option
 * @return {boolean}
 */
function leadingTrailingSlashes(option) {
    if (option.match(/^\/(\w+)\/$/)) {
        return true;
    }

    return false;
};

module.exports = {
    leadingTrailingSlashes: leadingTrailingSlashes
};