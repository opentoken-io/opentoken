"use strict";

describe("requestLoggerMiddleware", () => {
    var loggerMock, middlewareFactory;

    beforeEach(() => {
        var fakeConfig, randomMock;

        fakeConfig = {
            server: {
                requestIdLength: 8
            }
        };
        loggerMock = require("../../mock/logger-mock")();
        randomMock = require("../../mock/random-mock")();
        middlewareFactory = require("../../../lib/middleware/request-logger-middleware")(fakeConfig, loggerMock, randomMock);
    });
    it("makes middleware", () => {
        expect(middlewareFactory()).toEqual(jasmine.any(Function));
    });
    describe("middleware", () => {
        var req;

        beforeEach(() => {
            var middleware, middlewareAsync, res;

            req = require("../../mock/request-mock")();
            res = require("../../mock/response-mock")();

            // Remove the mock's properties
            delete req.log;
            delete req.logId;
            middleware = middlewareFactory();
            middlewareAsync = jasmine.middlewareToPromise(middleware);

            return middlewareAsync(req, res);
        });
        it("adds a .log() method", () => {
            expect(req.log).toEqual(jasmine.any(Function));
        });
        it("sets a .logId property", () => {
            expect(req.logId).toBe("BBBBBBBB");
        });
        it("allows logging through req.log()", () => {
            expect(loggerMock.info).not.toHaveBeenCalled();
            req.log("anything");
            expect(loggerMock.info).toHaveBeenCalled();
            expect(loggerMock.info.mostRecentCall.args[0]).toMatch(/^BBBBBBBB [^ ]* anything$/);
        });
    });
});
