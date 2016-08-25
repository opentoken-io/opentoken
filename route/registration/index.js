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
                        var url;

                        url = server.router.render("registration-secure", {
                            id: secureInfoGroup.id
                        });
                        res.header("Location", url);
                        res.links({
                            self: url
                        });
                        getResponse(secureInfoGroup, res);
                    }).then(next, next);
                }
            ]
        };
    });
};
