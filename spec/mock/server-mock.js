"use strict";

module.exports = () => {
    var mock;

    mock = {
        get: jasmine.createSpy("server.get"),
        use: jasmine.createSpy("server.use")
    };
    mock.router = {
        render: jasmine.createSpy("server.router.render").andCallFake((name) => {
            return `rendered route: ${name}`;
        })
    };

    return mock;
};
