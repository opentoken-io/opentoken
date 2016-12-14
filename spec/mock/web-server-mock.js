/**
 * Mock WebServer class
 */

"use strict";

var promiseMock;

promiseMock = require("./promise-mock")();

module.exports = () => {
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
            this.startServerAsync.andCallFake(() => {
                return promiseMock.resolve();
            });
            WebServerMock.mostRecentInstance = this;
        }
    }

    return WebServerMock;
};
