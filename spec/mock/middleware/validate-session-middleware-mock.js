"use strict";

module.exports = () => {
    var middleware, middlewareFactory;

    middleware = jasmine.createSpy("validateSessionMiddlewareMockMiddleware").andCallFake((req, res, next) => {
        next();
    });

    // This factory only returns the same middleware over and over.
    middlewareFactory = jasmine.createSpy("validateSessionMiddlewareMock").andReturn(middleware);

    return middlewareFactory;
};
