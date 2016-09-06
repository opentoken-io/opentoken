"use strict";

module.exports = (server, path, options) => {
    return options.container.call((tokenManager, validateSignatureMiddleware) => {
        return {
            get: [
                validateSignatureMiddleware(true),
                (req, res, next) => {
                    // Load the token
                    return tokenManager.getRecordAsync(req.params.accountId, req.params.tokenId).then((tokenRecord) => {
                        if (tokenRecord.public || req.signed) {
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

                            res.header("Content-Type", tokenRecord.contentType);
                            res.send(200, tokenRecord.data);
                        } else {
                            res.send(403);
                        }
                    }, (err) => {
                        // Only give a 404 if the user is allowed to see that
                        // the token did not exist.
                        if (req.signed) {
                            res.send(404);
                        } else {
                            res.send(403);
                        }

                        // Continue the problem state
                        throw err;
                    }).then(next, next);
                }
            ],
            name: "account-token"
        };
    });
};
