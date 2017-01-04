"use strict";

describe("email/log", () => {
    var email, loggerMock;

    beforeEach(() => {
        var promiseMock;

        loggerMock = require("../../mock/logger-mock")();
        promiseMock = require("../../mock/promise-mock")();
        email = require("../../../lib/email/log")(loggerMock, promiseMock);
    });
    it("logs when emails are to be sent", () => {
        expect(loggerMock.info).not.toHaveBeenCalled();

        return email.sendAsync("TO", "SUBJ", "TEXT").then(() => {
            var loggedMessage;

            expect(loggerMock.info).toHaveBeenCalled();
            loggedMessage = loggerMock.info.mostRecentCall.args[0];
            expect(loggedMessage).toContain("TO");
            expect(loggedMessage).toContain("SUBJ");
            expect(loggedMessage).toContain("TEXT");
        });
    });
});
