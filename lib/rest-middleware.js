"use strict";

module.exports = (helmet, logger, restify, restifyLinks, restifyPlugins) => {
    /**
     * Chains middleware from Helmet and other sources.
     *
     * @param {Object} config
     * @param {Object} server
     * @return {Function} useMiddleware
     */
    return (config, server) => {
        /**
         * Sets up the self discovery links.
         *
         * @param {Object} req
         * @param {Object} res
         * @param {Function} next
         */
        function standardLinks(req, res, next) {
            res.links({
                up: {
                    href: `${config.baseUrl}/`,
                    title: "self-discovery"
                }
            });

            if (req.method === "GET") {
                res.links({
                    self: config.baseUrl + req.href()
                });
            }

            next();
        }

        /**
         * Adds middleware to the server
         */
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

            // Security-related things come first
            server.use(helmet.ieNoOpen());
            server.use(helmet.noCache());
            server.use(helmet.noSniff());
            server.use(helmet.xssFilter());

            /* eslint new-cap:0 */
            server.use(restify.CORS());

            // Request and response processing
            server.use(restifyPlugins.queryParser({
                mapParams: false
            }));
            server.use(restifyPlugins.gzipResponse());

            // REST and Hypermedia
            server.use(restifyPlugins.acceptParser(server.acceptable));
            server.use(restifyLinks());
            server.use(standardLinks);
        }

        return useMiddleware();
    };
};
