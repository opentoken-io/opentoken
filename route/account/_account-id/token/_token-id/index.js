"use strict";

module.exports = (server, path, options) => {
    return options.container.call(() => {
        return {
            get: [
                (req, res, next) => {
                    // Load the token
                    return tokenManager.getAsync(req.params.accountId, req.params.tokenId).then((tokenRecord) => {
                        res.links({
                            up: [
                                {
                                    href: server.router.render("account", {
                                        accountId: req.params.accountId
                                    }),
                                    title: "account"
                                }
                            ]
                        });

                        if (tokenRecord.isPublic) {
                            sendToken(tokenRecord);

                            return next();
                        }

                        // Check the signature
                    });
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
