"use strict";


/**
 * @typedef {Object} opentoken~storageEngine
 * @property {Function} deleteAsync
 * @property {Function} getAsync
 * @property {Function} putAsync
 */


/**
 * @param {opentoken~config} config
 * @param {opentoken~container} container
 * @return {opentoken~storageEngine}
 */
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
