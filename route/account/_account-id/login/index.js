"use strict";

module.exports = (server, path, options) => {
    return options.container.call((accountManager, config, loginCookie, validateRequestBodyMiddleware) => {
        return {
            get(req, res, next) {
                // Clear any existing cookies
                loginCookie.clear(req, res);
                accountManager.loginHashConfigAsync(req.params.accountId).then((passwordHashConfig) => {
                    res.links({
                        service: {
                            href: server.router.render("account-login", {
                                accountId: req.params.accountId
                            }),
                            profile: "/schema/account/login-request.json",
                            title: "account-login"
                        },
                        up: {
                            href: server.router.render("account", {
                                accountId: req.params.accountId
                            }),
                            title: "account"
                        }
                    });
                    res.send(200, passwordHashConfig);
                }).then(next, next);
            },
            name: "account-login",
            post: [
                validateRequestBodyMiddleware("/account/login-request.json"),
                (req, res, next) => {
                    accountManager.loginAsync(req.params.accountId, req.body).then((login) => {
                        var accountRoute;

                        accountRoute = server.router.render("account", {
                            accountId: req.params.accountId
                        });
                        loginCookie.set(res, login.sessionId);
                        res.links({
                            up: {
                                href: accountRoute,
                                title: "account"
                            }
                        });
                        res.header("Location", accountRoute);
                        res.send(200, {
                            sessionId: login.sessionId
                        });
                    }, (err) => {
                        loginCookie.clear(req, res);

                        throw err;
                    }).then(next, next);
                }
            ]
        };
    });
};
