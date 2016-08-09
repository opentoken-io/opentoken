"use strict";

/**
 * Convert a call to middleware into a Promise.  The Promise is *REJECTED*
 * if the middleware calls `next()` with any value or if the middleware
 * throws.
 *
 * @param {Function} middleware
 * @return {Promise.<Function>} A Promised middleware accepting (req,res)
 */
jasmine.middlewareToPromise = (middleware) => {
    return (req, res) => {
        return new Promise((resolve, reject) => {
            try {
                middleware(req, res, (result) => {
                    if (typeof result === "undefined") {
                        resolve();
                    } else {
                        reject(result);
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    };
};
