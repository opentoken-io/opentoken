"use strict";

module.exports = (server, path, options) => {
    return options.container.call((accessCodeManager, config, sessionManager, validateRequestBodyMiddleware, validateSessionMiddleware) => {
        return {
            get: [
                validateSessionMiddleware(server),
                (req, res, next) => {
                    res.links({
                        service: {
                            href: server.router.render("account-accessCode", {
                                accountId: req.params.accountId
                            }),
                            profile: "/schema/account/access-code-request.json",
                            title: "account-accessCode"
                        },
                        up: {
                            href: server.router.render("account", {
                                accountId: req.params.accountId
                            }),
                            title: "account"
                        }
                    });
                    res.send(204, "", (err) => {
                        console.error(err);
                    });
                    next();
                }
            ],
            name: "account-accessCode",
            post: [
                validateRequestBodyMiddleware("/account/access-code-request.json"),
                validateSessionMiddleware(server),
                (req, res, next) => {
                    accessCodeManager.createAsync(req.params.accountId, req.body).then((codeInfo) => {
                        // Convert the OtDate to a string
                        codeInfo.expires = codeInfo.expires.toString();

                        // This does not have a "self" link because no
                        // resource is actually created.  That's not following
                        // Hypermedia very well, but since no resource is
                        // created we are unable to emit a self link.
                        res.links({
                            service: {
                                href: server.router.render("account-accessCode", {
                                    accountId: req.params.accountId
                                }),
                                profile: "/schema/account/access-code-request.json",
                                title: "account-accessCode"
                            },
                            up: {
                                href: server.router.render("account", {
                                    accountId: req.params.accountId
                                }),
                                title: "account"
                            }
                        });
                        res.send(201, codeInfo, (err) => {
                            console.error(err);
                        });
                    }).then(next, next);
                }
            ]
        };
    });
};
