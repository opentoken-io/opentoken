"use strict";

module.exports = function (config, container) {
    var classFactory, engine;

    if (!config.storage || !config.storage.engine) {
        throw new Error("Storage Engine not set");
    }

    engine = config.storage.engine;

    try {
        classFactory = require("./storage/" + engine);
    } catch (error) {
        throw new Error("Could not find Storage Engine: " + config.storage.engine);
    }

    return container.call(classFactory);
};