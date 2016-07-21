"use strict";

module.exports = (server, path, options) => {
    return options.container.call((accountManager, config) => {
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
            accountManager.logoutAsync(req.params.accountId, loginCookie.get(req)).then(next, next);
        }

        loginCookie = require("../_login-cookie")(config);

        return {
            get: logout,
            name: "account-logout",

            // Validation is not necessary
            post: logout
        };
    });
};
