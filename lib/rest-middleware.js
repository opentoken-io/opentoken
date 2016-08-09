"use strict";

module.exports = (helmet, linksMiddleware, logger, restify, restifyCookies, restifyLinks, restifyPlugins) => {
    /**
     * Chains middleware from Helmet and other sources.
     *
     * @param {Object} config
     * @param {Object} server
     * @return {Function} useMiddleware
     */
    return (config, server) => {
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
            server.use(restifyCookies.parse);
            server.use(restifyPlugins.queryParser({
                mapParams: false
            }));
            server.use(restifyPlugins.gzipResponse());

            // REST and Hypermedia
            server.use(restifyPlugins.acceptParser(server.acceptable));
            server.use(restifyLinks());
            server.use(linksMiddleware(server));
        }

        return useMiddleware();
    };
};
