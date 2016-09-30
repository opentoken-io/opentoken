"use strict";

module.exports = (config, container) => {
    var classFactory, engine;

    engine = config.storage.engine;

    try {
        classFactory = require(`./storage/${engine}`);
    } catch (error) {
        throw new Error(`Could not find storage engine: ${engine}`);
    }

    return container.call(classFactory);
};
