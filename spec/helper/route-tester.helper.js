"use strict";

var path;

path = require("path");

/**
 * @typedef {Object} routeTester~routeTester
 * @prop {Object} container The dependency injection container.
 * @prop {Object} exports The exported methods and possibly name from factory.
 * @prop {Function} [get] Method to issue a GET request if a handler exists.
 * @prop {Function} [head] Method to issue a HEAD request if a handler exists.
 * @prop {Function} [post] Method to issue a POST request if a handler exists.
 * @prop {Function} [put] Method to issue a PUT request if a handler exists.
 * @prop {Object} req Mock request object.
 * @prop {Object} res Mock response object.
 * @prop {Object} server Mock server object.
 * @prop {(Object|null)} validationResult From validating against a schema.
 */

/**
 * Attach methods to the resulting object to make testing
 * far easier.  With these methods, the tester may write code
 * like this:
 *
 *     routeTester.get().then(() => {
 *         expect(...thing...);
 *     }).then(done, done);
 *
 *     // or
 *     routeTester.post({
 *         data: "from the request"
 *     }).then(() => {
 *         expect(...thing...);
 *     });
 *
 * @param {routeTester~routeTester} routeTester
 */
function addRouteMethods(routeTester) {
    Object.keys(routeTester.exports).forEach((methodName) => {
        var middleware;

        middleware = routeTester.exports[methodName];

        if (Array.isArray(middleware)) {
            middleware = routeTester.container.resolve("chainMiddleware")(middleware);
        }

        if (typeof middleware === "function") {
            // Wrap the middleware so it returns a promise.
            middleware = jasmine.middlewareToPromise(middleware);
            routeTester[methodName] = (body) => {
                var schema;

                if (body) {
                    routeTester.req.body = body;

                    if (!Buffer.isBuffer(body)) {
                        body = new Buffer(JSON.stringify(body), "binary");
                        routeTester.req.getContentLength.andReturn(body.length);
                    }
                }

                schema = routeTester.container.resolve("schema");

                return schema.loadSchemaFolderAsync(path.resolve(__dirname, "../../schema")).then(() => {
                    return middleware(routeTester.req, routeTester.res);
                });
            };
        }
    });
}


/**
 * Set up tests for a route.  Does the majority of the grunt work for
 * getting the factory initialized.
 *
 * @param {string} routePath Path for the route in the URL
 * @param {(Function|null)} containerOverrideFn This lets you mock things
 * @param {Function} callback Where you add tests for the routes
 */
jasmine.routeTester = (routePath, containerOverrideFn, callback) => {
    describe(`route: ${routePath}`, () => {
        var factory;

        beforeEach(() => {
            factory = require(path.resolve(__dirname, "../../route", routePath.substr(1), "index.js"));
        });
        it("exports a factory", () => {
            expect(factory).toEqual(jasmine.any(Function));
        });
        describe("factory results", () => {
            var routeTester;

            routeTester = {};

            beforeEach(() => {
                var config, container, serverMock, validateRequestMiddleware;

                container = require("../../lib/dependencies");
                validateRequestMiddleware = jasmine.createSpy("validateRequestMiddleware").andCallFake((schemaPath) => {
                    return (req, res, next) => {
                        var result;

                        result = container.resolve("schema").validate(req.body, schemaPath);
                        routeTester.validationResult = result;

                        if (result) {
                            res.send(400, new Error(`Did not validate against schema: ${schemaPath}`));

                            return next(false);
                        }

                        return next();
                    };
                });
                config = container.resolve("config");
                config.baseDir = "/";
                container.register("config", config);
                container.register("validateRequestMiddleware", validateRequestMiddleware);

                if (containerOverrideFn) {
                    containerOverrideFn(container);
                }

                serverMock = require("../mock/server-mock")();

                // Reset props differently here so the callback can use
                // the object reference consistently.
                routeTester.container = container;
                routeTester.exports = factory(serverMock, routePath, {
                    container
                });
                routeTester.server = serverMock;
                routeTester.req = require("../mock/request-mock")();
                routeTester.res = require("../mock/response-mock")();
                routeTester.validationResult = null;
                addRouteMethods(routeTester);
            });
            callback(routeTester);
        });
    });
};
