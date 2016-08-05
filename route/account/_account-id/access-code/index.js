"use strict";

module.exports = (server, path, options) => {
    return options.container.call((accessCodeManager, config, sessionManager, validateRequestMiddleware, validateSessionMiddleware) => {
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
                    res.send(204);
                    next();
                }
            ],
            name: "account-accessCode",
            post: [
                validateRequestMiddleware("/account/access-code-request.json"),
                validateSessionMiddleware(server),
                (req, res, next) => {
                    accessCodeManager.createAsync(req.params.accountId, req.body).then((codeInfo) => {
                        res.send(201, codeInfo);
                    }).then(next, next);
                }
            ]
        };
    });
};
