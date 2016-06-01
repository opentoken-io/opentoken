"use strict";

var mockRequire;

mockRequire = require("mock-require");

describe("bin/server.js", () => {
    var apiServer, config;

    beforeEach(() => {
        var containerResults;

        apiServer = jasmine.createSpy("apiServer");
        config = {
            server: {
                port: 443
            }
        };
        containerResults = {
            apiServer,
            bootstrap() {
                return {
                    // Immediate promise resolution - no async stuff here
                    then(callback) {
                        callback();
                    }
                };
            },
            config,
            logger: {
                info() {}
            }
        };
        mockRequire("../../lib/dependencies", {
            resolve(thing) {
                return containerResults[thing];
            }
        });
    });
    afterEach(() => {
        mockRequire.stopAll();
    });
    it("does not modify config all the time", () => {
        mockRequire.reRequire("../../bin/server.js");
        expect(config).toEqual({
            server: {
                port: 443
            }
        });
        expect(apiServer).toHaveBeenCalled();
    });
    it("adds the port from the environment", () => {
        process.env.PORT = "1234";
        mockRequire.reRequire("../../bin/server.js");
        expect(config).toEqual({
            server: {
                port: 1234
            }
        });
        expect(apiServer).toHaveBeenCalled();
    });
    it("adds the debug flag from the environment", () => {
        process.env.DEBUG = "anything";
        mockRequire.reRequire("../../bin/server.js");
        expect(config).toEqual({
            debug: true,
            server: {
                port: 1234
            }
        });
        expect(apiServer).toHaveBeenCalled();
    });
});
