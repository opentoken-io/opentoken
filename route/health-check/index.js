"use strict";

module.exports = (server, pathUrl, options) => {
    return options.container.call(() => {
        return {
            get(req, res, next) {
                res.send(200, {
                    status: "healthy"
                });
                next();
            },
            name: "health-check"
        };
    });
};
