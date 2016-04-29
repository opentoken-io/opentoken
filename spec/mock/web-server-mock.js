/**
 * Mock WebServer class
 */

"use strict";

var promiseMock;

promiseMock = require("./promise-mock");

class WebServerMock {
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
