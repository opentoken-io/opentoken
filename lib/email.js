"use strict";

module.exports = (logger) => {
    /**
     * Send an email by filling in a template.
     *
     * @param {string} email
     * @param {string} templateName
     * @param {Object} vars
     */
    function sendTemplate(email, templateName, vars) {
        logger.info(`Emailing ${templateName} to ${email} ... ${JSON.stringify(vars)}`);
    }

    return {
        sendTemplate
    };
};
