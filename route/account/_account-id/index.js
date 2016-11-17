"use strict";

module.exports = (server, path, options) => {
    return options.container.call((accountManager, validateSessionMiddleware) => {
        return {
            get: [
                validateSessionMiddleware(server),
                (req, res, next) => {
                    // Load the account record
                    return accountManager.recordAsync(req.params.accountId).then((account) => {
                        res.links({
                            service: [
                                {
                                    href: server.router.render("account-accessCode", {
                                        accountId: req.params.accountId
                                    }),
                                    profile: "/schema/account/access-code-request.json",
                                    title: "account-accessCode"
                                },
                                {
                                    href: server.router.render("account-logout", {
                                        accountId: req.params.accountId
                                    }),
                                    profile: "/schema/account/logout-request.json",
                                    title: "account-logout"
                                },
                                {
                                    href: `${server.router.render("account-token-create", {
                                        accountId: req.params.accountId
                                    })}{?public}`,
                                    profile: "/schema/account/token-create-request.json",
                                    templated: true,
                                    title: "account-token-create"
                                }
                            ]
                        });
                        res.send(200, account.record);
                    }).then(next, next);
                }
            ],
            name: "account"
        };
    });
};
