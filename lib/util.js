"use strict";

/**
 * Utility functions.
 *
 * MUST NOT REQUIRE DEPENDENCIES FROM OPENTOKEN'S LIB FOLDER!!
 *
 * @return {util~instance}
 */
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


    /**
     * Returns a new object that is a deep merge of two other objects.
     *
     * @param {*} base
     * @param {*} override
     * @return {*}
     */
    function deepMerge(base, override) {
        var result;

        if (typeof override === "undefined") {
            return clone(base);
        }

        if (typeof override !== "object") {
            return override;
        }

        if (typeof base !== "object") {
            return clone(override);
        }

        result = clone(base);
        Object.keys(override).forEach((propName) => {
            result[propName] = deepMerge(result[propName], override[propName]);
        });

        return result;
    }


    /**
     * @typedef {Object} util~instance
     * @property {Function.<Array.<*>>} arrayRequireItems(haystack, needle)
     * @property {Function.<*>} clone(input)
     * @property {Function.<*>} deepMerge(base, override)
     */
    return {
        arrayRequireItems,
        clone,
        deepMerge
    };
};
