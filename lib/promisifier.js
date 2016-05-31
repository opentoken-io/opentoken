"use strict";

module.exports = (promise) => {
    return (otherModule) => {
        if (typeof otherModule === "function") {
            otherModule = promise.promisify(otherModule);
        }

        return promise.promisifyAll(otherModule);
    };
};
