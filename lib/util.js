"use strict";

module.exports = () => {
    /**
     * Returns a list of elements that are not in the haystack.
     *
     * @param {Array.<*>} haystack
     * @param {Array.<*>} needles
     * @return {Array.<*>} Needles not found in haystack
     */
    function arrayRequireItems(haystack, needles) {
        return needles.filter((item) => {
            return haystack.indexOf(item) === -1;
        });
    }


    /**
     * Return a deep copy of an object.
     *
     * @param {*} input
     * @return {*} copy
     */
    function clone(input) {
        if (typeof input === "object" && input) {
            return JSON.parse(JSON.stringify(input));
        }

        return input;
    }


    return {
        arrayRequireItems,
        clone
    };
};
