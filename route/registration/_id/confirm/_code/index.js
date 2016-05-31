"use strict";

module.exports = (server, path, options) => {
    return options.container.call((registrationManager) => {
        return {
            get(req, res, next) {
                registrationManager.confirmEmailAsync(req.params.id, req.params.code).then((accountId) => {
                    res.links({
                        self: req.href(),
                        service: {
                            href: server.router.render("account-login"),
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
