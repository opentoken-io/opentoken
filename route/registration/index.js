"use strict";

var getHandler;

getHandler = require("./_id/_get.js");

module.exports = (server, path, options) => {
    return options.container.call((registrationManager, schema, validateRequestMiddleware) => {
        return {
            name: "registration-register",
            post: [
                validateRequestMiddleware("/registration/register-request.json"),
                (req, res, next) => {
                    registrationManager.registerAsync(req.body).then((secureInfoGroup) => {
                        var url;

                        url = server.router.render("registration-secure", {
                            id: secureInfoGroup.id
                        });
                        res.header("Location", url);
                        res.links({
                            self: url
                        });
                        getHandler(server, secureInfoGroup, res);
                    }).then(next, next);
                }
            ]
        };
    });
};
