"use strict";

module.exports = (server, pathUrl, options) => {
    return options.container.call((config, path, restifyPlugins) => {
        if (pathUrl.charAt(path.length - 1) === "/") {
            server.get(/\/schema\/.*/, restifyPlugins.serveStatic({
                charSet: "utf-8",
                directory: path.resolve(config.baseDir),
                match: /\.json$/
            }));
        }

        return {
            get(req, res, next) {
                res.setHeader("Content-Type", "text/plain");
                res.send(`API running ${new Date()}\n`);
                next();
            }
        };
    });
};
