"use strict";

var mockRequire;

mockRequire = require("mock-require");

describe("bin/server.js", () => {
    var apiServer, config, containerValues, neodocArgs;

    beforeEach(() => {
        apiServer = jasmine.createSpy("apiServer");
        neodocArgs = {};
        containerValues = {
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
            logger: require("../mock/logger-mock")(),
            neodoc: {
                run: jasmine.createSpy("neodoc").andReturn(neodocArgs)
            },
            path: require("path"),
            util: require("../mock/util-mock")()
        };
        mockRequire("../../lib/container", {
            register(key, value) {
                containerValues[key] = value;
            },
            resolve(thing) {
                return containerValues[thing];
            }
        });
        mockRequire("../../config.json", {
            server: {
                port: 443
            }
        });
        mockRequire("/override.json", {
            override: true
        });
    });
    afterEach(() => {
        mockRequire.stopAll();
    });
    it("uses override files", () => {
        neodocArgs["--override"] = "/override.json";
        mockRequire.reRequire("../../bin/server.js");
        expect(containerValues.config).toEqual({
            deep: "merge"
        });
        expect(apiServer).toHaveBeenCalled();
    });
    it("does not modify config all the time", () => {
        mockRequire.reRequire("../../bin/server.js");
        expect(containerValues.config).toEqual({
            server: {
                port: 443
            }
        });
        expect(apiServer).toHaveBeenCalled();
    });
    it("adds the port from the environment", () => {
        process.env.PORT = "1234";
        mockRequire.reRequire("../../bin/server.js");
        expect(containerValues.config).toEqual({
            server: {
                port: 1234
            }
        });
        expect(apiServer).toHaveBeenCalled();
    });
    it("adds the debug flag from the environment", () => {
        process.env.DEBUG = "anything";
        mockRequire.reRequire("../../bin/server.js");
        expect(containerValues.config).toEqual({
            debug: true,
            server: {
                port: 1234
            }
        });
        expect(apiServer).toHaveBeenCalled();
    });
});
