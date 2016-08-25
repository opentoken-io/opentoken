"use strict";

var container;

container = require("../../../lib/dependencies");

module.exports = () => {
    var middleware, middlewareFactory;

    middleware = jasmine.createSpy("validateRequestBodyMiddlewareMockMiddleware").andCallFake((req, res, next) => {
        var result;

        result = container.resolve("schema").validate(req.body, middleware.schemaPath);

        if (result) {
            res.send(400, new Error(`Did not validate against schema: ${middleware.schemaPath}`));

            return next(false);
        }

        return next();
    });

    // This factory only returns the same middleware over and over.
    middlewareFactory = jasmine.createSpy("validateRequestBodyMiddlewareMock").andCallFake((schemaPath) => {
        middleware.schemaPath = schemaPath;

        return middleware;
    });

    return middlewareFactory;
};
