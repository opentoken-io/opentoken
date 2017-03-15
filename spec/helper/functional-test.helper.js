"use strict";

var chalk, crypto, querystring;

// Required for the class
chalk = require("chalk");
crypto = require("crypto");
querystring = require("querystring");


/**
 * @typedef {Object} opentoken~functionalTestResponse
 * @property {*} body Can be anything, including objects.
 * @property {Object} headers
 * @property {Object} links The Link header reformatted for ease of use
 * @property {number} statusCode
 * @property {string} uri
 */

/**
 * Functional Test
 *
 * This object tracks important bits of information and allows tests to
 * perform actions that are required to functionally test the API.
 */
class FunctionalTest {
    /**
     * Initialization.
     *
     * @param {functionalRouteTester~functionalTest} test
     */
    constructor(test) {
        this.test = test;
        this.nodeMocksHttp = null;
        this.state = {};

        // The request handler needs to be assigned or nothing works.
        // It's the routing middleware function.
        this.requestHandler = null;

        // This is how the test sends email.  Make sure to set this
        // after the object is created.
        this.sendEmailSpy = null;
    }


    /**
     * Create access codes
     *
     * @return {Promise.<functionalTestResponse>}
     */
    createAccessCodesAsync() {
        return this.loginAsync().then((response) => {
            if (response.statusCode !== 200) {
                throw new Error(`Invalid status code from login. Status code ${response.statusCode}`);
            }

            return this.followAsync(response, "up", "account", {
                headers: {
                    Cookie: `login=${this.state.sessionId}`
                }
            });
        }).then((response) => {
            if (response.statusCode !== 200) {
                throw new Error(`Invalid status code from following 'up' link. Status code: ${response.statusCode}`);
            }

            return this.followAsync(response, "service", "account-accessCode", {
                body: {
                    description: "Test Codes"
                },
                headers: {
                    Cookie: `login=${this.state.sessionId}`
                }
            });
        }).then((response) => {
            var body;

            if (response.statusCode !== 201) {
                throw new Error("Error requesting access codes");
            }

            body = JSON.parse(response.body);
            this.state.accessCode = body.code;
            this.state.accessSecret = body.secret;

            return response;
        });
    }


    /**
     * Creates an account.  Returns a Promise that will be rejected with
     * an error or resolved with the response from creating the account.
     *
     * Usage:
     *
     *   return functionalTest.createAccountAsync().then((response) => { ... });
     *
     * @return {Promise.<functionalTestResponse>}
     */
    createAccountAsync() {
        return this.startAsync("service", "registration-register", {
            body: {
                email: "test@example.com"
            }
        }).then((response) => {
            if (response.statusCode !== 200) {
                throw new Error(`Initial POST was not successful. Status code ${response.statusCode}`);
            }

            this.state.registrationId = response.getHeader("Location").split("/")[2];

            // MFA validation is mocked to always succeed.
            return this.followAsync(response, "edit", "registration-secure", {
                body: {
                    mfa: {
                        totp: {
                            current: "000000",
                            previous: "111111"
                        }
                    },
                    passwordHash: "123456789012345678901234567890"
                },
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }).then((response) => {
            var email, match, uri;

            if (response.statusCode !== 204) {
                throw new Error("Securing the registration failed");
            }

            if (!this.sendEmailSpy.calls.mostRecent()) {
                throw new Error("No email was sent");
            }

            email = this.sendEmailSpy.calls.mostRecent().args[2];
            match = email.match(/\/registration\/[a-zA-Z0-9_-]+\/confirm\/([a-zA-Z0-9-_]+)/);

            if (!match) {
                throw new Error("Unable to find confirmation link");
            }

            this.state.confirmationId = match[1];
            uri = match[0];

            return this.requestAsync({
                url: uri
            });
        }).then((response) => {
            var body;

            if (response.statusCode !== 201) {
                throw new Error(`Invalid status code from registration confirmation. Status code ${response.statusCode}`);
            }

            body = JSON.parse(response.body);
            this.state.accountId = body.accountId;

            return response;
        });
    }


    /**
     * Helper method to diagnose what's going wrong.
     *
     * Use this in your promise chain.
     *
     *   .then((response) => {
     *       test.debug(response);
     *   });
     *
     * @param {Promise.<opentoken~functionalTestAsyncResponse>} response
     */
    debug(response) {
        var links, logger;

        /**
         * Shows a heading.
         *
         * @param {string} text
         */
        function heading(text) {
            console.log(chalk.blue.bold(`----- ${text} -----`));
        }


        /**
         * Helper to list calls to logger.xxxxx methods, which are spies.
         *
         * @param {Object} call Items in Jasmine's spy.calls array.
         */
        function dumpCall(call) {
            console.log(call.args);
        }


        logger = this.container.resolve("logger");
        heading("LOGGER.INFO CALLS");
        logger.info.calls.forEach(dumpCall);
        heading("LOGGER.CONSOLE CALLS");
        logger.console.calls.forEach(dumpCall);
        heading("RESPONSE");
        links = response.links;
        response.links = "(Object dumped separately)";
        console.log(response);
        response.links = links;
        heading("RESPONSE.LINKS");
        console.log(links);
        heading("DEBUG COMPLETE");
    }


    /**
     * Finds the link definition object in a list of formatted links.
     *
     * @param {Object} links From HttpLinkHeader
     * @param {string} rel
     * @param {string} [title]
     * @return {(Object|Error)} Link definition or error message
     */
    findLink(links, rel, title) {
        var linkArray, suffix;

        linkArray = links.rel(rel);

        if (!linkArray) {
            return new Error(`No links found for relation ${rel}`);
        }

        suffix = "";

        if (title) {
            linkArray = linkArray.filter((item) => {
                return item.title === title;
            });
            suffix = `, title "${title}"`;
        }

        if (linkArray.length > 1) {
            return new Error(`Multiple links found for relation "${rel}"${suffix}`);
        }

        if (linkArray.length < 1) {
            return new Error(`No links exist for relation "${rel}"${suffix}`);
        }

        return linkArray[0];
    }


    /**
     * Searches for a given link.  If found, this follows the link and
     * the promise will be resolved with the response.
     *
     * @param {Function} response
     * @param {string} rel
     * @param {string} [title]
     * @param {nodeMocksHttp~mockRequestOptions} [options]
     * @return {Promise.<opentoken~functionalTestResponse>}
     */
    followAsync(response, rel, title, options) {
        var linkDefinition;

        if (typeof title === "object") {
            options = title;
            title = null;
        }

        if (!options) {
            options = {};
        }

        linkDefinition = this.findLink(response.links, rel, title);

        if (linkDefinition instanceof Error) {
            return Promise.reject(linkDefinition);
        }

        options.url = linkDefinition.uri;

        return this.requestAsync(options);
    }


    /**
     * Shortcut to login after an account is created.
     *
     * @return {Promise.<opentoken~functionalTestResponse>}
     */
    loginAsync() {
        var promise;

        if (this.state.accountId) {
            promise = Promise.resolve();
        } else {
            promise = this.createAccountAsync();
        }

        return promise.then(() => {
            return this.startAsync("service", "account-login", {
                body: {
                    challengeHash: "123456789012345678901234567890",
                    mfa: {
                        totp: "222222"
                    }
                },
                parameters: {
                    accountId: this.state.accountId
                }
            });
        }).then((response) => {
            var body;

            if (response.statusCode !== 200) {
                throw new Error(`Invalid status code from login. Status code: ${response.statusCode}`);
            }

            body = JSON.parse(response.body);
            this.state.sessionId = body.sessionId;

            return response;
        });
    }


    /**
     * This function formats the request options and makes requests.
     *
     * @param {nodeMocksHttp~mockRequestOptions} options
     * @return {Promise.<functionalRouteTester~response>}
     */
    requestAsync(options) {
        this.reformatRequestOptions(options);

        return this.test.requestAsync(options.method, options.url, options);
    }


    /**
     * Set up reasonable defaults and convert incoming data into what is
     * expected by the middleware.
     *
     * Modifies the object directly.
     *
     * @param {nodeMocksHttp~mockRequestOptions} options
     */
    reformatRequestOptions(options) {
        if (!options.headers) {
            options.headers = {};
        }

        if (!this.test.getHeader(options.headers, "Host")) {
            options.headers.Host = "localhost";
        }

        // Set some default properties for posting data
        if (options.body) {
            if (!options.method) {
                options.method = "POST";
            }

            if (!this.test.getHeader(options.headers, "Content-Type")) {
                options.headers["Content-Type"] = "application/json";
            }
        }

        if (!options.method) {
            options.method = "GET";
        }

        if (options.signed) {
            this.signRequest(options);
        }
    }


    /**
     * Signs a request and adds the necessary headers to the options
     * being passed to the mock HTTP request.
     *
     * Modifies the object directly
     *
     * @param {nodeMocksHttp~mockRequestOptions} options
     */
    signRequest(options) {
        var dateString, hmac, path, queryString, signature, signingContent;

        if (!options.headers) {
            options.headers = {};
        }

        if (!this.test.getHeader(options.headers, "Content-Type")) {
            options.headers["Content-Type"] = "application/octet-stream";
        }

        dateString = new Date().toISOString();
        options.headers["X-OpenToken-Date"] = dateString;

        if (options.body) {
            options.body = this.test.coerseToBuffer(options.body);
        } else if (Buffer.alloc) {
            // node.js v5.10.0 and newer
            options.body = Buffer.alloc(0, 0, "binary");
        } else {
            // Deprecated as of node.js 6.0.0
            options.body = new Buffer(0);
        }

        path = options.url;
        queryString = querystring.stringify(options.query);

        if (options.parameters) {
            Object.keys(options.parameters).forEach((key) => {
                path = path.replace(`{${key}}`, options.parameters[key]);
            });
        }

        if (!this.test.getHeader(options.headers, "Host")) {
            options.headers.Host = "localhost";
        }

        // Build the signing content as a big buffer
        signingContent = [
            options.method.toUpperCase(),
            path,
            queryString,
            `host:${this.test.getHeader(options.headers, "Host").toLowerCase()}`,
            `content-type:${this.test.getHeader(options.headers, "Content-Type")}`,
            `x-opentoken-date:${dateString}`,
            "",
            options.body.toString("binary")
        ];
        signingContent = signingContent.join("\n");
        signingContent = new Buffer(signingContent, "binary");

        // Calculate the HMAC
        hmac = crypto.createHmac("sha256", this.state.accessSecret);
        hmac.update(signingContent);
        signature = hmac.digest("hex").toLowerCase();

        // Add the header to the request
        options.headers.Authorization = `OT1-HMAC-SHA256-HEX; access-code=${this.state.accessCode}; signed-headers=host content-type x-opentoken-date; signature=${signature}`;
    }


    /**
     * Initiates a request chain.  It will start with the self discovery
     * endpoint.  If given additional arguments, a link will be followed
     * off of the self discovery endpoint.
     *
     * @param {string} [rel]
     * @param {string} [title]
     * @param {nodeMocksHttp~mockRequestOptions} options
     * @return {Promise.<opentoken~functionalTestResponse>}
     */
    startAsync(rel, title, options) {
        var promise;

        promise = this.requestAsync({
            url: "/"
        });

        if (rel && title) {
            promise = promise.then((response) => {
                return this.followAsync(response, rel, title, options);
            });
        }

        return promise;
    }
}

jasmine.FunctionalTest = FunctionalTest;
