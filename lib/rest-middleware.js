function restMiddleware(helmet, logger, restifyLinks) {
    /**
     * Chains middleware from Helmet and other sources.
     *
     * @param {Object} config
     * @return {Function} useMiddleware
     */
    return function(config, server) {
        /**
         * Sets up the self discovery link.
         *
         * @param {Object} req
         * @param {Object} res
         * @param {Function} next
         */
        function standardLinks(req, res, next) {
            res.links({
                self: config.baseUrl + req.href(),
                up: {
                    href: config.baseUrl + "/",
                    title: "self-discovery"
                }
            });
            next();
        }

        function useMiddleware() {
            logger.debug("Adding Middleware in restMiddleware");

            server.use(helmet.frameguard({
                action: "deny"
            }));
            server.use(helmet.hidePoweredBy());

            if (config.https) {
                server.use(helmet.hsts({
                    maxAge: 365 * 24 * 60 * 60 * 1000,
                    includeSubdomains: true,
                    force: true
                }));
            }

            server.use(helmet.ieNoOpen());
            server.use(helmet.noCache());
            server.use(helmet.noSniff());
            server.use(helmet.xssFilter());
            server.use(restifyLinks());
            server.use(standardLinks);
        }

        return useMiddleware();
    };
}

module.exports = restMiddleware;
