"use strict";

/**
 * @param {Restify} server
 * @param {string} path
 * @param {*} options
 * @return {Function} middleware
 */
module.exports = (server, path, options) => {
    /**
     * @param {opentoken~config} config
     * @param {opentoken~readBodyBufferMiddleware} readBodyBufferMiddleware
     * @param {opentoken~tokenManager} tokenManager
     * @param {opentoken~validateRequestQueryMiddleware} validateRequestQueryMiddleware
     * @param {opentoken~validateSignatureMiddleware} validateSignatureMiddleware
     * @return {restifyRouterMagic~routeDef}
     */
    return options.container.call((config, readBodyBufferMiddleware, tokenManager, validateRequestQueryMiddleware, validateSignatureMiddleware) => {
        return {
            name: "account-tokenCreate",
            post: [
                readBodyBufferMiddleware(config.server.bodyBytesMaximum),
                validateSignatureMiddleware(),
                validateRequestQueryMiddleware("/account/token-create-request.json"),

                /**
                 * @param {restify~Request} req
                 * @param {restify~Response} res
                 * @param {Function} next
                 */
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
