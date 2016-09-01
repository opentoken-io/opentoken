"use strict";

module.exports = (server, path, options) => {
    return options.container.call((readBodyBufferMiddleware, tokenManager, validateSignatureMiddleware) => {
        return {
            get: [
                readBodyBufferMiddleware(),
                validateSignatureMiddleware(true),
                (req, res, next) => {
                    // Load the token
                    return tokenManager.getRecordAsync(req.params.accountId, req.params.tokenId).then((tokenRecord) => {
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

                        if (tokenRecord.isPublic || req.signed) {
                            res.header("Content-Type", tokenRecord.contentType);
                            res.send(200, tokenRecord.data);
                        } else {
                            res.send(403);
                        }
                    }).then(next, next);
                }
            ],
            name: "account-token"
        };
    });
};
