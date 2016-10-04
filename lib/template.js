"use strict";

/**
 * Template processing routines.
 *
 * Includes areas where templates are processed and handed off to other
 * systems.
 *
 * @param {binaryBuffer~instance} binaryBuffer
 * @param {Object} config
 * @param {email~instance} email
 * @param {Object} fsAsync
 * @param {Object} mustache
 * @param {Object} path
 * @param {promise~instance} promise
 * @return {template~instance}
 */
module.exports = (binaryBuffer, config, email, fsAsync, mustache, path, promise) => {
    var emailPath;

    /**
     * Generates text from a single template.
     *
     * @param {*} data
     * @param {string} pathBase Folder for templates
     * @param {string} templateName
     * @return {Promise.<string>} Completed template
     */
    function processTemplateAsync(data, pathBase, templateName) {
        var templatePath;

        templatePath = path.resolve(pathBase, templateName);

        return fsAsync.readFileAsync(templatePath).then((contentsBuffer) => {
            var contentsString;

            contentsString = binaryBuffer.toString(contentsBuffer);

            return mustache.render(contentsString, data);
        });
    }


    /**
     * Sends a templated email.
     *
     * @param {string} recipient
     * @param {string} templateName
     * @param {*} data
     * @return {Promise.<*>}
     */
    function sendEmailAsync(recipient, templateName, data) {
        var templateData;

        templateData = {
            config,
            data
        };

        return promise.props({
            html: processTemplateAsync(templateData, emailPath, `${templateName}-html`),
            subject: processTemplateAsync(templateData, emailPath, `${templateName}-subject`),
            text: processTemplateAsync(templateData, emailPath, `${templateName}-text`)
        }).then((bits) => {
            return email.sendAsync(recipient, bits.subject.trim(), bits.text, bits.html);
        });
    }


    emailPath = path.resolve(config.baseDir, config.template.emailPath);

    /**
     * @typedef {Object} template~instance
     * @property {Function.<Promise.<string>>} processTemplateAsync(data, pathBase, templateName)
     * @property {Function.<Promise.<*>>} sendEmailAsync(recipient, templateName, data)
     */
    return {
        processTemplateAsync,
        sendEmailAsync
    };
};
