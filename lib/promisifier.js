"use strict";

module.exports = (promise) => {
    return (otherModule) => {
        return promise.promisifyAll(otherModule);
    };
};
