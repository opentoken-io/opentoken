"use strict";

/**
 * Inspect the login cookie and make sure the session is valid.
 *
 * Use this as middleware in your route files.
 */

module.exports = (loginCookie, sessionManager) => {
    /**
     * Looks at the login cookie.  If valid, refreshes the cookie.  If invalid,
     * this reports a 401 unauthorized and provides a link to an account's
     * login.
     *
     * @param {Restify} server
     * @return {function} middleware
     */
    return (server) => {
        return (req, res, next) => {
            sessionManager.validateAsync(req.params.accountId, loginCookie.get(req)).then(() => {
                loginCookie.refresh(req, res);

                return next();
            }, () => {
                var accountId, ldo;

                ldo = {
                    profile: "/schema/account/login-request.json",
                    title: "account-login"
                };

                if (req.params.accountId) {
                    accountId = req.params.accountId;
                } else {
                    accountId = "{accountId}";
                    ldo.templated = true;
                }

                ldo.href = server.router.render("account-login", {
                    accountId
                });

                res.links({
                    service: ldo
                });

                if (ldo.templated) {
                    // If there is no account ID, redirect to self-discovery.
                    res.header("Location", server.router.render("self-discovery"));
                } else {
                    // Account ID was found, redirect to the login endpoint.
                    res.header("Location", ldo.href);
                }

                res.send(401);

                return next(false);
            });
        };
    };
};
