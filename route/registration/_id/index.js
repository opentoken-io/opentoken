"use strict";

module.exports = (server, path, options) => {
    return options.container.call((registrationManager, validateRequestMiddleware) => {
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
                validateRequestMiddleware("/registration/secure-request.json"),
                (req, res, next) => {
                    registrationManager.secureAsync(req.params.id, req.body, server).then(() => {
                        res.send(204);
                    }).then(next, next);
                }
            ]
        };
    });
};
