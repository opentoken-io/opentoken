"use strict";

module.exports = (server, path, options) => {
    return options.container.call((config, readBodyBufferMiddleware, tokenManager, validateRequestQueryMiddleware, validateSignatureMiddleware) => {
        return {
            name: "account-tokenCreate",
            post: [
                readBodyBufferMiddleware(config.server.bodyBytesMaximum),
                validateSignatureMiddleware(),
                validateRequestQueryMiddleware("/account/token-create-request.json"),
                (req, res, next) => {
                    var publicFlag;

                    publicFlag = false;

                    // Query string values are always strings - compare as such
                    if (req.query && req.query.public === "true") {
                        publicFlag = true;
                    }

                    tokenManager.createAsync(req.params.accountId, req.body, {
                        contentType: req.headers["content-type"],
                        public: publicFlag
                    }).then((tokenId) => {
                        var uri;

                        uri = server.router.render("account-token", {
                            accountId: req.params.accountId,
                            tokenId
                        });
                        res.header("Location", uri);
                        res.links({
                            self: uri,
                            up: {
                                href: server.router.render("account", {
                                    accountId: req.params.accountId
                                }),
                                title: "account"
                            }
                        });
                        res.send(201);
                    }).then(next, next);
                }
            ]
        };
    });
};
