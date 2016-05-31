"use strict";

var getHandler;

getHandler = require("./_get.js");

module.exports = (server, path, options) => {
    return options.container.call((registrationManager, validateRequestMiddleware) => {
        return {
            get(req, res, next) {
                registrationManager.secureInfoAsync(req.params.id).then((secureInfoGroup) => {
                    getHandler(server, secureInfoGroup, res);
                }).then(null, (err) => {
                    console.log(err.stack);
                    throw err;
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
