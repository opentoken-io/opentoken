"use strict";

describe("email", () => {
    var email;

    beforeEach(() => {
        var loggerMock;

        loggerMock = require("../mock/logger-mock")();
        email = require("../../lib/email")(loggerMock);
    });
    it("exposes sendTemplate", () => {
        expect(email.sendTemplate).toEqual(jasmine.any(Function));

        // This is only for coverage.  The function itself does nothing.
        email.sendTemplate("test@example.com", "test-email", {});
    });
});
