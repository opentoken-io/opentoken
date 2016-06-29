"use strict";

module.exports = (server, path, options) => {
    return options.container.call((accountManager, config, validateRequestMiddleware) => {
        var loginCookie;

        /**
         * Logs a user out of the system.
         *
         * @param {Object} req
         * @param {Object} res
         * @param {Function} next
         */
        function logout(req, res, next) {
            loginCookie.clear(req, res);
            res.header("Location", config.server.baseUrl);
            res.send(204);
            next();
        }

        loginCookie = require("./login/_login-cookie")(config);

        return {
            get: logout,
            name: "account-logout",

            // Validation is not necessary
            post: logout
        };
    });
};
