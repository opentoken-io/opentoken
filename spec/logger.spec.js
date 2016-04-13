"use strict";

describe("logger", () => {
    var log, logger;

    beforeEach(() => {
        logger = require("../lib/logger");

        spyOn(console, "log");
        spyOn(console, "error");
    });

    describe("constructor", () => {
        beforeEach(() => {
            log = new logger({});
        });

        it("prints to log from info", () => {
            log.info("something");
            expect(console.log).toHaveBeenCalledWith("something");
        });

        it("prints to error from error", () => {
            log.error("something");
            expect(console.error).toHaveBeenCalledWith("ERROR: something");
        });

        it("prints to error from warn", () => {
            log.warn("something");
            expect(console.error).toHaveBeenCalledWith("WARN: something");
        });

        it("prints to log from console", () => {
            log.console("something");
            expect(console.log).toHaveBeenCalledWith("something");
        });

        it("does not print to error from debug", () => {
            log.debug("something");
            expect(console.error).not.toHaveBeenCalledWith("something");
        });
    });

    describe("constructor with debug set", () => {
        beforeEach(() => {
            log = new logger({
                debug: true
            });
        });

        it("prints to error from debug", () => {
            log.debug("something");
            expect(console.error).toHaveBeenCalledWith("DEBUG: something");
        });
    });
});
