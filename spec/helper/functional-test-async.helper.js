"use strict";

/**
 * @typedef {Object} opentoken~functionalTestAsyncResponse
 * @propety {*} body Can be anything, including objects.
 * @property {Object} links The Link header reformatted for ease of use
 * @property {Object} headers
 * @property {number} statusCode
 */

/**
 * @typedef {Object} opentoken~functionalTestAsyncTest
 * @property {Function} follow Follow a link from the last response
 * @property {Function} request How to issue a request
 * @property {Function} requestHandler Assigned when event is listened
 * @property {Function} start Make a request to / and possibly follow a link
 */

var events, mockRequire, originalEventEmitter;


/**
 * Create an object that extends EventEmitter so EventEmitter does
 * not have additional methods added due to Restify.
 *
 * Because everything uses `EventEmitter.call(this)`, this safety
 * layer can not be a typical class.  Instead, it is wired up this way.
 *
 * Also, this has to be the same safety layer that is used every time,
 * so don't go creating new safety layers continually.
 *
 * @return {*} Whatever EventEmitter returns
 */
function EventEmitterSafetyLayer() {
    var args;

    args = [].slice.call(arguments);

    // eslint-disable-next-line new-cap
    return originalEventEmitter.call(this, args);
}


/**
 * Loads the config object and overrides with mandatory settings for
 * testing.
 *
 * @return {opentoken~config}
 */
function getConfig() {
    var config;

    config = require("../../config.json");

    // Forcibly override some settings.
    config.debug = false;
    config.email.engine = "mock";
    config.record.encryptionKeyFile = "encryption.key.dev";
    config.server.baseUrl = "http://localhost:8080";

    if (config.server.certificateFile) {
        delete config.server.certificateFile;
    }

    if (config.server.keyFile) {
        delete config.server.keyFile;
    }

    config.server.port = 8080;
    config.server.profileMiddleware = false;
    config.server.proxyProtocol = false;

    if (config.server.spdy) {
        delete config.server.spdy;
    }

    config.signature.host = "localhost";
    config.storage.engine = "in-memory";

    return config;
}


/**
 * Gets a completely new and reset container.  After this function is called,
 * future require() calls to the container will also return a pristine
 * container.
 *
 * @param {Object} config
 * @return {Dizzy}
 */
function getContainer(config) {
    var container;

    // Get a fresh copy of the container
    container = mockRequire.reRequire("../../lib/container");

    // Now, require again so the `container` variable can be modified
    // without affecting other tests
    mockRequire.reRequire("../../lib/container");

    // Set the config
    container.register("config", config);

    // Eliminate some modules
    container.register("logger", require("../mock/logger-mock")());
    container.register("challengeManager", require("../mock/manager/challenge-manager-mock")());
    container.register("totp", require("../mock/mfa/totp-mock")());

    return container;
}


/**
 * Mock the necessary bits of http.  This prevents tests from starting a
 * real server and listening on a real port.  It also reports back about
 * the request handler that is registered to handle HTTP requests.
 *
 * Properties will be assigned to test:
 *
 * test.requestHandler - The callback registered with .on("request", ...)
 *
 * @param {opentoken~FunctionalTest} test
 */
function mockHttpAndEvents(test) {
    var http, httpServerMock;

    http = require("http");

    // Preload modules so they get the real EventEmitter
    try {
        // bunyan is required by restify.  npm <= 3.x installs bunyan under
        // restify and the next line can error.  That's ok.
        // We should only require it here and if it fails we ignore the error.
        require("bunyan");
    } catch (e) {
        // Ignore
    }

    // Mock the necessary bits to avoid making a server
    // and still have access to the router.
    httpServerMock = jasmine.createSpyObj("httpServerMock", [
        "listen",
        "on"
    ]);
    httpServerMock.listen.andCallFake((port, callback) => {
        callback();
    });
    httpServerMock.on.andCallFake((event, callback) => {
        if (event === "request") {
            test.requestHandler = callback;
        }
    });
    spyOn(http, "createServer").andReturn(httpServerMock);

    // Restify modifies this directly when booting, so we modify it here.
    // The end result is that this must inherit from whatever
    // nodeMocksHttp uses.  Additional methods are added to this object's
    // prototype.
    jasmine.swapProperty(http, "IncomingMessage", EventEmitterSafetyLayer);

    // nodeMocksHttp uses this directly when creating a response.  This
    // must be the same object or a descendant of what Restify uses.
    jasmine.swapProperty(events, "EventEmitter", EventEmitterSafetyLayer);

    // Now rerequire nodeMocksHttp and provide it to the FunctionalTest object.
    test.setNodeMocksHttp(mockRequire.reRequire("node-mocks-http"));
}


events = require("events");
mockRequire = require("mock-require");

// This finishes the setup of the safety layer and sets up the object
// prototypes.
originalEventEmitter = events.EventEmitter;
EventEmitterSafetyLayer.prototype = Object.create(originalEventEmitter.prototype);
EventEmitterSafetyLayer.prototype.constructor = originalEventEmitter;

/**
 * Starts up the server and bootstraps.
 *
 * The resulting promise provides the request submitting function.
 *
 * @return {Promise.<opentoken~FunctionalTest>}
 */
jasmine.functionalTestAsync = () => {
    var config, container, test;

    // Create the FunctionalTest object, which is what the promise will
    // provide.
    test = new jasmine.FunctionalTest();

    // Get a completely new and reset container, including mocks.
    config = getConfig();
    container = getContainer(config);
    test.container = container;

    // Mock some required libraries.
    mockHttpAndEvents(test);

    // Bootstrap
    return container.resolve("bootstrap")().then(() => {
        return container.resolve("apiServer")();
    }).then(() => {
        test.sendEmailSpy = container.resolve("email").sendAsync;

        return test;
    });
};

