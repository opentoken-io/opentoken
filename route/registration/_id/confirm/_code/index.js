"use strict";

module.exports = (server, path, options) => {
    return options.container.call((registrationManager) => {
        return {
            get(req, res, next) {
                registrationManager.confirmEmailAsync(req.params.id, req.params.code).then((accountId) => {
                    // First, wipe all links
                    res.setHeader("Link", "");

                    // Add the "up" link that's always added by default.
                    res.links({
                        up: server.router.render("self-discovery")
                    });

                    // Add more links
                    res.links({
                        self: server.router.render("account", {
                            accountId
                        }),
                        service: {
                            href: server.router.render("account-login", {
                                accountId
                            }),
                            profile: "/schema/account/login-request.json",
                            title: "account-login"
                        }
                    });
                    res.send(201, {
                        accountId
                    });
                }).then(next, next);
            },
            name: "registration-confirm"
        };
    });
};
