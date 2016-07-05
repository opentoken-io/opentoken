"use strict";

module.exports = (config) => {
    var cookieName, cookieSettings;

    /**
     * Clears the login cookie
     *
     * @param {Object} req Request
     * @param {Object} res Response
     */
    function clear(req, res) {
        if (req.cookies[cookieName]) {
            res.setCookie(cookieName, "");
        }
    }


    /**
     * Returns the login cookie value from the request.
     *
     * @param {Object} req Request
     * @return {string} May be an empty string.
     */
    function get(req) {
        return req.cookies[cookieName];
    }


    /**
     * Refreshes the login cookie, allowing it to last longer in the browser.
     *
     * @param {Object} req Request
     * @param {Object} res Response
     */
    function refresh(req, res) {
        if (!req.cookies[cookieName]) {
            return;
        }

        res.setCookie(cookieName, req.cookies[cookieName], cookieSettings);
    }


    /**
     * Assigns a login cookie
     *
     * @param {Object} res Response
     * @param {string} value
     */
    function set(res, value) {
        res.setCookie(cookieName, value, cookieSettings);
    }


    cookieSettings = config.account.loginCookie.settings;
    cookieName = config.account.loginCookie.name;

    // Avoiding shorthand here because node.js does not like using
    // it for get and set.  Tried with node v5.12.0
    /* eslint object-shorthand:"off" */
    return {
        clear,
        get: get,
        refresh,
        set: set
    };
};
