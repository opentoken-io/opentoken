"use strict";

/**
 * @param {Object} config
 * @param {Dizzy} container
 * @return {email~instance}
 */
module.exports = (config, container) => {
    var classFactory, engine;

    engine = config.email.engine;

    try {
        classFactory = require(`./email/${engine}`);
    } catch (error) {
        throw new Error(`Could not find email engine: ${engine}`);
    }

    /**
     * @typedef {Object} email~instance
     * @property {Function.<Promise.<*>>} sendAsync(recipient, subject, text, html)
     */
    return container.call(classFactory);
};
