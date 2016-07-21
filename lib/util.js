"use strict";

module.exports = () => {
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
        clone
    };
};
