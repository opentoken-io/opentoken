"use strict";

module.exports = (server, path, options) => {
    /**
     * @param {opentoken~ErrorResponse} ErrorResponse
     * @param {opentoken~registrationManager} registrationManager
     * @param {opentoken~validateRequestBodyMiddleware} validateRequestBodyMiddleware
     * @return {restifyRouterMagic~route}
     */
    return options.container.call((ErrorResponse, registrationManager, validateRequestBodyMiddleware) => {
        var getResponse;

        getResponse = require("./_get-response")(server);

        return {
            get(req, res, next) {
                registrationManager.getRecordAsync(req.params.id).then((secureInfoGroup) => {
                    getResponse(secureInfoGroup, res);
                }).then(next, next);
            },
            name: "registration-secure",
            post: [
                validateRequestBodyMiddleware("/registration/secure-request.json"),
                (req, res, next) => {
                    registrationManager.secureAsync(req.params.id, req.body, server).then((secureInfoGroup) => {
                        res.links({
                            self: server.router.render("registration-secure", {
                                id: secureInfoGroup.id
                            })
                        });
                        res.send(204, "", (err) => {
                            console.error(err);
                        });
                    }).then(next, (badRegistration) => {
                        req.log(badRegistration.toString);
                        res.send(400, new ErrorResponse("Invalid information", "6a6BwJexiW"), (err) => {
                            console.error(err);
                        });
                        next();
                    });
                }
            ]
        };
    });
};
