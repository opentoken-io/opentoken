"use strict";

describe("registrationManager", () => {
    var factory;

    beforeEach((override) => {
        var config;

        override = override || {};
        config = {
            account: {},
            registration: {
                idLength: 222
            }
        };
        factory = () => {
            return require("../../../lib/registration/registration-manager")(accountManagerMock, config, promiseMock, randomMock, registrationServiceMock, schemaMock, totpMock);
        };
    });
});
