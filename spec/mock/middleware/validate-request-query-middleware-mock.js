"use strict";

var container;

container = require("../../../lib/container");

module.exports = () => {
    var middleware, middlewareFactory;

    middleware = jasmine.createSpy("validateRequestQueryMiddlewareMockMiddleware").andCallFake((req, res, next) => {
        var result;

        req.query = req.query || {};
        result = container.resolve("tv4").validateResult(req.query, middleware.schemaPath);

        if (!result.valid) {
            res.send(400, new Error(`Did not validate against schema: ${middleware.schemaPath}`));

            return next(false);
        }

        return next();
    });

    // This factory only returns the same middleware over and over.
    middlewareFactory = jasmine.createSpy("validateRequestQueryMiddlewareMock").andCallFake((schemaPath) => {
        middleware.schemaPath = schemaPath;

        return middleware;
    });

    return middlewareFactory;
};
