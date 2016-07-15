"use strict";

module.exports = (server, path, options) => {
    return options.container.call((accountManager, config, validateRequestMiddleware) => {
        var loginCookie;

        loginCookie = require("../_login-cookie")(config);

        return {
            get(req, res, next) {
                // Clear any existing cookies
                loginCookie.clear(req, res);
                accountManager.loginHashConfigAsync(req.params.id).then((passwordHashConfig) => {
                    res.links({
                        item: {
                            href: server.router.render("account", {
                                id: req.params.id
                            }),
                            title: "account"
                        },
                        service: {
                            href: server.router.render("account-login", {
                                id: req.params.id
                            }),
                            profile: "/schema/account/login-request.json",
                            title: "account-login"
                        }
                    });
                    res.send(200, {
                        passwordHashConfig
                    });
                }).then(next, next);
            },
            name: "account-login",
            post: [
                validateRequestMiddleware("/account/login-request.json"),
                (req, res, next) => {
                    accountManager.loginAsync(req.params.id, req.body).then((login) => {
                        var accountRoute;

                        accountRoute = server.router.render("account", {
                            id: req.params.id
                        });
                        loginCookie.set(res, login.sessionId);
                        res.links({
                            item: {
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
