"use strict";

module.exports = () => {
    var middleware, middlewareFactory;

    middleware = jasmine.createSpy("validateSessionMiddlewareMockMiddleware").and.callFake((req, res, next) => {
        next();
    });

    // This factory only returns the same middleware over and over.
    middlewareFactory = jasmine.createSpy("validateSessionMiddlewareMock").and.returnValue(middleware);

    return middlewareFactory;
};
