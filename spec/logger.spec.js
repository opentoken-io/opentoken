describe("logger", function () {
    "use strict";

    var log, logger;

    logger = require("../lib/logger");

    beforeEach(function () {
        spyOn(console, "log");
        spyOn(console, "error");
        spyOn(console.log, "apply");
    });

    describe("constructor", function () {
        beforeEach(function () {
            log = new logger({});
        });

        it("prints to log from info", function () {
            log.info("something");
            expect(console.log).toHaveBeenCalledWith("something");
        });

        it("prints to error from error", function () {
            log.error("something");
            expect(console.error).toHaveBeenCalledWith("ERROR: something");
        });

        it("prints to error from warn", function () {
            log.warn("something");
            expect(console.error).toHaveBeenCalledWith("WARN: something");
        });

        it("prints to log from console", function () {
            log.console("something");
            expect(console.log.apply.mostRecentCall.args[1]).toEqual(["something"]);
        });

        it("does not print to error from debug", function () {
            log.debug("something");
            expect(console.error).not.toHaveBeenCalledWith("something");
        });
    });

    describe("constructor with debug set", function () {
        beforeEach(function () {
            log = new logger({
                debug: true
            });
        });

        it("prints to error from debug", function () {
            log.debug("something");
            expect(console.error).toHaveBeenCalledWith("DEBUG: something");
        });
    });
});