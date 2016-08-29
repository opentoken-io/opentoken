"use strict";

module.exports = (server, path, options) => {
    return options.container.call((registrationManager, validateRequestBodyMiddleware) => {
        var getResponse;

        getResponse = require("./_id/_get-response")(server);

        return {
            name: "registration-register",
            post: [
                validateRequestBodyMiddleware("/registration/register-request.json"),
                (req, res, next) => {
                    registrationManager.registerAsync(req.body).then((secureInfoGroup) => {
                        var uri;

                        uri = server.router.render("registration-secure", {
                            id: secureInfoGroup.id
                        });
                        res.header("Location", uri);
                        res.links({
                            self: uri
                        });
                        getResponse(secureInfoGroup, res);
                    }).then(next, next);
                }
            ]
        };
    });
};
