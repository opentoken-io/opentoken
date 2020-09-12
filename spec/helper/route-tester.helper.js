"use strict";

var path;

path = require("path");

/**
 * @typedef {Object} routeTester~routeTester
 * @property {Object} container The dependency injection container.
 * @property {Object} exports Exported methods and possibly name from factory.
 * @property {Function} [get] Issue a GET request if a handler exists.
 * @property {Function} [head] Issue a HEAD request if a handler exists.
 * @property {Function} [post] Issue a POST request if a handler exists.
 * @property {Function} [put] Issue a PUT request if a handler exists.
 * @property {Object} req Mock request object.
 * @property {Object} res Mock response object.
 * @property {Object} server Mock server object.
 * @property {(Object|null)} validationResult From validating against a schema.
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
                var tv4;

                if (body) {
                    if (!Buffer.isBuffer(body)) {
                        if (typeof body === "string") {
                            body = Buffer.from(body, "binary");
                        } else {
                            routeTester.req.body = Buffer.from(JSON.stringify(body), "binary");
                        }
                    }

                    routeTester.req.body = body;
                    routeTester.req.internalContentLength = body.length;
                }

                tv4 = routeTester.container.resolve("tv4");

                return tv4.loadSchemaFolderAsync(path.resolve(__dirname, "../../schema")).then(() => {
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
                var config, container, serverMock;

                container = require("../../lib/container");
                config = require("../../config.json");
                config.baseDir = "/";
                container.register("config", config);

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
