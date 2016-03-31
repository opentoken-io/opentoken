function restMiddleware (connect, helmet, logger, restifyLinks) {
    /**
     * Sets up the self link of the current path we are on.
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    function selfLink (req, res, next) {
        res.links({
            self: "https://" + req.header("host") + req.url
        });

        next();
    }


    /**
     * Sets up the self discovery link.
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    function upLink (req, res, next) {
        res.links({
            up: {
                href: "https://" + req.header("host") + "/",
                title: "self-discovery"
            }
        });

        next();
    }


    /**
     * Chains middleware from Helmet and other sources.
     *
     * @param {Object} config
     * @return {Function} useMiddleware
     */
    return function (config) {
        function useMiddleware () {
            var middleware = connect();

            logger.debug("Adding Middleware in restMiddleware");

            middleware.use(helmet.frameguard({
                action: "deny"
            }));
            middleware.use(helmet.hidePoweredBy());

            if (config.https) {
                middleware.use(helmet.hsts({
                    maxAge: 365 * 24 * 60 * 60 * 1000,
                    includeSubdomains: true,
                    force: true
                }));
            }

            middleware.use(helmet.ieNoOpen());
            middleware.use(helmet.noCache());
            middleware.use(helmet.noSniff());
            middleware.use(helmet.xssFilter());
            middleware.use(restifyLinks());
            middleware.use(selfLink);
            middleware.use(upLink);

            return middleware;
        };

        return useMiddleware();
    };
};

module.exports = restMiddleware;