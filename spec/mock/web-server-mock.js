/**
 * Mock WebServer class
 */

"use strict";

var promiseMock;

promiseMock = require("./promise-mock");

/**
 * This is a fake WebServer
 */
class WebServerMock {
    /**
     * Create the object.  Sets up spies on new instances.
     *
     * @param {Object} config
     */
    constructor(config) {
        this.config = config;

        [
            "addRoutes",
            "startServerAsync"
        ].forEach((methodName) => {
            this[methodName] = jasmine.createSpy(methodName);
        });
        this.startServerAsync.andReturn(promiseMock.resolve());
        WebServerMock.mostRecentInstance = this;
    }
}

module.exports = WebServerMock;
