"use strict";

module.exports = () => {
    return {
        get: function (req, res, next) {
            res.setHeader("Content-Type", "text/plain");
            res.send("API running " + (new Date()) + "\n");
            next();
        }
    };
};
