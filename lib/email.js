"use strict";

module.exports = () => {
    /**
     * Send an email by filling in a template.
     *
     * @param {string} email
     * @param {string} templateName
     * @param {Object} vars
     */
    function sendTemplate(email, templateName, vars) {
        console.log("Emailing", email, templateName, vars);
    }

    return {
        sendTemplate
    };
};
