"use strict";

module.exports = (config) => {
    var baseUrl;

    baseUrl = config.server.baseUrl;

    /**
     * Generates middleware for the given server and configuration.
     * The generated middleware adds links to all resulting resources.
     * More links will be added in routes.
     *
     * @param {Restify} server
     * @return {Function} useMiddleware
     */
    return (server) => {
        var linksForAllResources;

        /**
         * Sets up the self discovery links and ones that should exist
         * for every resource.
         *
         * @param {Object} req
         * @param {Object} res
         * @param {Function} next
         */
        return (req, res, next) => {
            // Cache this chunk of links for better speed
            if (!linksForAllResources) {
                linksForAllResources = {
                    up: {
                        href: server.router.render("self-discovery"),
                        title: "self-discovery"
                    }
                };
            }

            res.links(linksForAllResources);

            if (req.method === "GET") {
                res.links({
                    self: baseUrl + req.href()
                });
            }

            next();
        };
    };
};
