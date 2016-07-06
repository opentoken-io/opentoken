"use strict";

module.exports = (server, path, options) => {
    return options.container.call((accountManager, config, sessionManager) => {
        var loginCookie;

        loginCookie = require("./_login-cookie")(config);

        return {
            get(req, res, next) {
                // Check the login session
                sessionManager.validateAsync(loginCookie.get(req), req.params.id).then(() => {
                    // Then also load the account record
                    return accountManager.recordAsync(req.params.id);
                }).then((account) => {
                    // Session is valid, account loads
                    loginCookie.refresh(req, res);
                    res.links({
                        service: {
                            href: server.router.render("account-logout", {
                                id: req.params.id
                            }),
                            profile: "/schema/account/logout.json",
                            title: "account-logout"
                        }
                    });
                    res.send(200, account.record);
                }, () => {
                    // Not valid right now
                    loginCookie.clear(req, res);
                    res.links({
                        item: {
                            href: server.router.render("account-login", {
                                id: req.params.id
                            }),
                            title: "account-login"
                        }
                    });
                    res.send(401);
                }).then(next, next);
            },
            name: "account"
        };
    });
};
