/**
 * Inspect the login cookie and make sure the session is valid.
 *
 * Use this as middleware in your route files.
 */

"use strict";

/**
 * @param {opentoken~ErrorResponse} ErrorResponse
 * @param {opentoken~loginCookie} loginCookie
 * @param {opentoken~sessionManager} sessionManager
 * @return {Function} middleware factory
 */
module.exports = (ErrorResponse, loginCookie, sessionManager) => {
    /**
     * Looks at the login cookie.  If valid, refreshes the cookie.  If invalid,
     * this reports a 403 Forbidden and provides a link to an account's
     * login.
     *
     * @param {Restify} server
     * @return {Function} middleware
     */
    return (server) => {
        var selfDiscoveryLink;

        return (req, res, next) => {
            sessionManager.validateAsync(req.params.accountId, loginCookie.get(req)).then(() => {
                loginCookie.refresh(req, res);

                return next();
            }, (rejection) => {
                var accountId, error, ldo;

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
                    if (!selfDiscoveryLink) {
                        selfDiscoveryLink = server.router.render("self-discovery");
                    }

                    res.header("Location", selfDiscoveryLink);
                } else {
                    // Account ID was found, redirect to the login endpoint.
                    res.header("Location", ldo.href);
                }

                req.log(`validate-session-middleware: ${rejection.toString()}`);
                error = new ErrorResponse("Session is invalid.", "8gzh4j1A");
                res.contentType = error.mimeType();
                res.send(403, error);

                return next(false);
            });
        };
    };
};
