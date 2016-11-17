/**
 * Utility functions for the examples.
 *
 */

"use strict";

var Bluebird, container, encoding, parseLinkHeader, requestLibAsync, tv4, twofa, Uri, util;

// ------------------ Dependencies for other functions ----------------

/**
 * Convert a string into camelCase by removing hyphens/underlines and
 * capitalizing the next letter.
 *
 * @param {string} str
 * @return {string}
 */
function toCamelCase(str) {
    return str.replace(/[-_]./g, (match) => {
        return match.charAt(1).toUpperCase();
    });
}


/**
 * Resolve a URI against another URI
 *
 * @param {string} base
 * @param {string} relative
 * @return {string}
 */
function resolveUri(base, relative) {
    return new Uri(relative, base).toString();
}


/**
 * Make a request.  Process the request when done so the Link header is
 * more readily usable.
 *
 * @param {string} method
 * @param {string} uri
 * @param {*} data
 * @return {Promise.<Object>} Response
 */
function requestAsync(method, uri, data) {
    var requestOptions;

    requestOptions = {
        headers: {},
        jar: true,
        json: data,
        method,
        uri
    };

    return requestLibAsync(requestOptions).then((res) => {
        var body, links;

        if (res.statusCode < 200 || res.statusCode >= 300) {
            throw new Error(`Invalid status code ${res.statusCode}: ${uri}`);
        }

        // Use a library to parse all link headers
        links = parseLinkHeader(res.headers.link);
        res.link = {};

        // Reformat the links so you can access them with
        // res.link[rel][title].  Both the link relation and the title
        // will be converted to camel case.
        //
        // The OpenToken.io API will not emit multiple links with the
        // same link relation and title combination.  Thus, links should
        // never be overwritten with the following code.
        Object.keys(links).forEach((rel) => {
            var relCamel;

            relCamel = toCamelCase(rel);
            [].concat(links[rel]).forEach((linkDefinition) => {
                var titleCamel;

                if (!res.link[relCamel]) {
                    res.link[relCamel] = {};
                }

                // Resolve the href property.
                // Note: the library does not use .href and instead uses
                // .url.  So, we'll make .href be the absolute URI.
                linkDefinition.href = resolveUri(uri, linkDefinition.url);

                // Also resolve the profile.
                if (linkDefinition.profile) {
                    linkDefinition.profile = resolveUri(uri, linkDefinition.profile);
                }

                if (linkDefinition.title) {
                    titleCamel = linkDefinition.title.replace(/-/g, "_");
                } else {
                    titleCamel = "default";
                }

                res.link[relCamel][titleCamel] = linkDefinition;
            });
        });

        // Parse the response if it is valid JSON
        try {
            body = JSON.parse(res.body);
            res.body = body;
        } catch (e) {
            // eslint no-empty:"off"
        }

        return res;
    });
}


/**
 * Call TV4 to validate data.  If there is a missing schema, download it
 * and try again.
 *
 * @param {*} data
 * @param {string} schema
 * @return {Promise.<*>}
 */
function tv4ValidateAsync(data, schema) {
    return new Bluebird((resolve, reject) => {
        var result;

        result = tv4.validate(data, schema);

        if (tv4.missing.length) {
            resolve(Bluebird.map(tv4.missing, (uri) => {
                return requestAsync("GET", uri).then((res) => {
                    tv4.addSchema(uri, res.body);
                });
            }).then(() => {
                return tv4ValidateAsync(data, schema);
            }));
        } else if (result) {
            resolve();
        } else {
            reject(tv4.error);
        }
    });
}


/**
 * Validates that the data provided matches a profile in a link.
 * When the link has no profile link, this resolves successfully.
 *
 * @param {Object} link
 * @param {*} data
 * @return {Promise.<*>}
 */
function validateDataAsync(link, data) {
    if (!link.profile) {
        return Bluebird.resolve();
    }

    return tv4ValidateAsync(data, link.profile);
}


// -------------------------- Alphabetized ---------------------------

/**
 * Gets the OpenToken configuration from the environment and the parsed
 * command-line arguments.
 *
 * @param {Object} args Parsed command-line arguments.
 * @return {Object}
 */
function config(args) {
    var result;

    result = {};
    [
        "account",
        "api",
        "mfa",
        "password"
    ].forEach((name) => {
        var val;

        val = process.env[`OPENTOKEN_${name.toUpperCase()}`];

        if (name === "api" && !val) {
            val = "https://api.opentoken.io";
        }

        if (args[`--${name}`]) {
            val = args[`--${name}`];
        }

        if (val) {
            val = val.trim();
        }

        if (val && val !== "") {
            result[name] = val;
        }
    });

    return result;
}


/**
 * Issues a GET request.  Handles templated URLs.
 *
 * @param {Object} link
 * @param {Object} [templateValues={}]
 * @return {Promise.<*>}
 */
function getLinkAsync(link, templateValues) {
    var linkCopy;

    if (!templateValues) {
        templateValues = {};
    }

    linkCopy = util.clone(link);
    linkCopy.href = Uri.expand(linkCopy.href, templateValues).toString();

    return requestAsync("GET", linkCopy.href);
}


/**
 * Validates and sends a POST to the API.
 *
 * @param {Object} link
 * @param {*} data
 * @return {Promise.<*>}
 */
function postLinkAsync(link, data) {
    return validateDataAsync(link, data).then(() => {
        return requestAsync("POST", link.href, data);
    });
}


/**
 * Generate a TOTP code.
 *
 * @param {string} keyBase32
 * @param {number} [offset=0]
 * @return {string}
 */
function totpCode(keyBase32, offset) {
    var codeIndex, mfaKey;

    codeIndex = Math.floor(Date.now() / 30000);
    mfaKey = encoding.decode(keyBase32, "base32");

    if (offset) {
        codeIndex += offset;
    }

    return twofa.generateCode(mfaKey, codeIndex);
}


Bluebird = require("bluebird");
container = require("../lib/container");
encoding = container.resolve("encoding");
parseLinkHeader = require("parse-link-header");
requestLibAsync = Bluebird.promisify(require("request"));
tv4 = Bluebird.promisifyAll(require("tv4"));
twofa = require("2fa");
Uri = require("urijs");
util = container.resolve("util");

// This loads extra functionality into urijs
require("urijs/src/URITemplate.js");

module.exports = {
    config,
    getLinkAsync,
    postLinkAsync,
    requestAsync,
    resolveUri,
    totpCode,
    validateDataAsync
};
