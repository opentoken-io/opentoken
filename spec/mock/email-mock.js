"use strict";

module.exports = () => {
    return {
        sendTemplate: jasmine.createSpy("emailMock.sendTemplate")
    };
};
