"use strict";

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("challengeManagerMock", [
        "testingDeleteMe"
    ]);

    return mock;
};
