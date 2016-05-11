"use strict";

function leadingTrailingSlashes(option) {
    if (option.match(/^\/(\w+)\/$/)) {
        return true;
    }

    return false;
};

module.exports = {
    leadingTrailingSlashes: leadingTrailingSlashes
};