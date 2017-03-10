"use strict";

module.exports = () => {
    var middleware, middlewareFactory;

    middleware = jasmine.createSpy("read-body-buffer-middleware-mock-middleware").and.callFake((req, res, next) => {
        next();
    });

    // This factory only returns the same middleware over and over.
    middlewareFactory = jasmine.createSpy("read-body-buffer-middleware-mock-factory").and.returnValue(middleware);

    return middlewareFactory;
};
