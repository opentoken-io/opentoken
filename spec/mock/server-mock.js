"use strict";

module.exports = () => {
    var mock;

    mock = {
        get: jasmine.createSpy("server.get"),
        use: jasmine.createSpy("server.use")
    };
    mock.router = {
        render: jasmine.createSpy("server.router.render").and.callFake((name, obj) => {
            var route;

            route = `rendered route: ${name}`;

            if (obj) {
                Object.keys(obj).forEach((key) => {
                    route += `, ${key}:${JSON.stringify(obj[key])}`;
                });
            }

            return route;
        })
    };

    return mock;
};
