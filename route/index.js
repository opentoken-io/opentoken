"use strict";

module.exports = (server, pathUrl, options) => {
    return options.container.call((config, path, restifyPlugins) => {
        server.get(/\/schema\/.*/, restifyPlugins.serveStatic({
            charSet: "utf-8",
            directory: path.resolve(config.baseDir),
            match: /\.json$/
        }));

        return {
            get(req, res, next) {
                res.links({
                    service: [
                        {
                            href: server.router.render("account-login", {
                                accountId: "TEMPLATED"
                            }).replace("TEMPLATED", "{accountId}"),
                            profile: "/schema/account/login-request.json",
                            templated: true,
                            title: "account-login"
                        },
                        {
                            href: `${server.router.render("account-tokenCreate", {
                                accountId: "TEMPLATED"
                            }).replace("TEMPLATED", "{accountId}")}{?public}`,
                            profile: "/schema/account/token-create-request.json",
                            templated: true,
                            title: "account-tokenCreate"
                        },
                        {
                            href: server.router.render("health-check"),
                            title: "health-check"
                        },
                        {
                            href: server.router.render("registration-register"),
                            profile: "/schema/registration/register-request.json",
                            title: "registration-register"
                        }
                    ]
                });
                res.send(204, "", (err) => {
                    console.error(err);
                });
                next();
            },
            name: "self-discovery"
        };
    });
};
