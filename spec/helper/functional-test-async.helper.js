"use strict";


/**
 * @typedef {Object} opentoken~functionalTestAsyncTest
 * @property {Function} follow Follow a link from the last response
 * @property {Function} request How to issue a request
 * @property {Function} requestHandler Assigned when event is listened
 * @property {Function} start Make a request to / and possibly follow a link
 */

var mockRequire;

mockRequire = require("mock-require");


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
 * Starts up the server and bootstraps.
 *
 * The resulting promise provides the request submitting function.
 *
 * @return {Promise.<opentoken~FunctionalTest>}
 */
jasmine.functionalTestAsync = () => {
    var config, container, otTest;

    // Create the FunctionalTest object, which is what the promise will
    // provide.
    return jasmine.restifyFunctionalTestAsync(() => {
        // Get a completely new and reset container, including mocks.
        config = getConfig();
        container = getContainer(config);

        // Bootstrap
        return container.resolve("bootstrap")().then(() => {
            return container.resolve("apiServer")();
        });
    }).then((test) => {
        otTest = new jasmine.FunctionalTest(test);
        otTest.container = container;
        otTest.sendEmailSpy = container.resolve("email").sendAsync;

        return otTest;
    });
};

