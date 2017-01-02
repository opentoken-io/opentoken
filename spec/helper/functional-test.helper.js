"use strict";

var chalk, crypto, events, parseLinkHeader;

// Required for the class
chalk = require("chalk");
crypto = require("crypto");
events = require("events");
parseLinkHeader = require("parse-link-header");


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
     */
    constructor() {
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
     * Converts a value into a buffer.  Used for generating the body of
     * a request.
     *
     * @param {*} val
     * @return {Buffer}
     */
    coerseToBuffer(val) {
        if (Buffer.isBuffer(val)) {
            return val;
        }

        if (typeof val !== "string") {
            val = JSON.stringify(val);
        }

        return new Buffer(val, "binary");
    }


    /**
     * Create access codes
     *
     * @return {Promise.<functionalTestResponse>}
     */
    createAccessCodesAsync() {
        return this.loginAsync().then((response) => {
            if (response.statusCode !== 200) {
                throw new Error("Invalid status code from login");
            }

            return this.followAsync(response, "up", "account", {
                headers: {
                    Cookie: `login=${this.state.sessionId}`
                }
            });
        }).then((response) => {
            if (response.statusCode !== 200) {
                throw new Error("Invalid status code from following 'up' link");
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
            if (response.statusCode !== 201) {
                throw new Error("Error requesting access codes");
            }

            this.state.accessCode = response.body.code;
            this.state.accessSecret = response.body.secret;

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
                throw new Error("Initial POST was not successful");
            }

            this.state.registrationId = response.headers.Location.split("/")[2];

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
                },
                method: "POST"
            });
        }).then((response) => {
            var email, match, uri;

            if (response.statusCode !== 204) {
                throw new Error("Securing the registration failed");
            }

            if (!this.sendEmailSpy.mostRecentCall) {
                throw new Error("No email was sent");
            }

            email = this.sendEmailSpy.mostRecentCall.args[2];
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
            this.state.accountId = response.body.accountId;

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
     * @param {Object} links From parseLinkHeader
     * @param {string} rel
     * @param {string} [title]
     * @return {(Object|Error)} Link definition or error message
     */
    findLink(links, rel, title) {
        var linkArray, suffix;

        linkArray = links[rel];

        if (!linkArray) {
            return new Error(`No links found for relation ${rel}`);
        }

        // Standardize
        linkArray = [].concat(linkArray);
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

        options.url = linkDefinition.url;

        return this.requestAsync(options);
    }


    /**
     * Find a header if it exists.  Because headers are case insensitive,
     * this function needs to scan them all.
     *
     * @param {Object} headers
     * @param {string} headerName
     * @return {*} Header's value
     */
    getHeader(headers, headerName) {
        var headerNameLowerCase, matches;

        headerNameLowerCase = headerName.toLowerCase();

        matches = Object.keys(headers).filter((key) => {
            return key.toLowerCase() === headerNameLowerCase;
        });

        if (!matches.length) {
            return null;
        }

        return headers[matches[0]];
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
            this.state.sessionId = response.body.sessionId;

            return response;
        });
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

        if (!this.getHeader(options.headers, "Host")) {
            options.headers.Host = "localhost";
        }

        // Munge the URI by replacing parameters.
        if (options.parameters) {
            Object.keys(options.parameters).forEach((key) => {
                options.url = options.url.replace(`{${key}}`, options.parameters[key]);
            });
        }

        // Add query string options to the URI.
        if (options.query) {
            Object.keys(options.query).forEach((key) => {
                if (options.url.indexOf("?") === -1) {
                    options.url += "?";
                } else {
                    options.url += "&";
                }

                options.url += `${key}=${options.query[key]}`;
            });
        }


        // Set some default properties for posting data
        if (options.body) {
            options.body = this.coerseToBuffer(options.body);

            if (!options.method) {
                options.method = "POST";
            }

            if (!this.getHeader(options.headers, "Content-Type")) {
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
     * This function makes requests, returns a promise, formats output
     * and even creates a timer.  How wonderful!
     *
     * @param {nodeMocksHttp~mockRequestOptions} options
     * @return {Promise.<opentoken~functionalTestAsyncResponse>}
     */
    requestAsync(options) {
        var originalHeader, req, res;

        this.reformatRequestOptions(options);
        req = this.nodeMocksHttp.createRequest(options);
        res = this.nodeMocksHttp.createResponse({
            eventEmitter: events.EventEmitter,
            req
        });

        // The res.header() function does not operate in a similar fashion to
        // how Restify's version works.  Restify allows for a single string
        // input and this returns the value.  We monkey patch the response
        // object to behave similarly.
        originalHeader = res.header;
        res.header = (key, val) => {
            if (!val && typeof key === "string") {
                return res.getHeader(key);
            }

            return originalHeader.call(res, key, val);
        };

        return new Promise((resolve, reject) => {
            var theTimeout;

            // The mock request object overwrites .path(), but Restify
            // wants to find its own function there.  Luckily we can fix this
            // and the mock doesn't need the original path value for anything.
            req.path = req.getPath;

            // The mock does not have a resume() function.  Also, the body
            // parser overwrites req.body, so this has to use the
            // request options and convert it to a Buffer.
            req.resume = () => {
                setTimeout(() => {
                    if (options.body) {
                        req.emit("data", options.body);
                    }

                    req.emit("end");
                });
            };

            res.on("end", () => {
                /* eslint-disable no-underscore-dangle */
                resolve({
                    body: res._getData(),
                    headers: res._getHeaders(),
                    links: parseLinkHeader(res._getHeaders().Link),
                    statusCode: res._getStatusCode(),
                    uri: options.url
                });

                if (theTimeout) {
                    clearTimeout(theTimeout);
                }
            });

            // Requests that do not finish quickly will reject the promise.
            theTimeout = setTimeout(() => {
                reject(new Error("Request timed out"));
                theTimeout = null;
            }, 2000);

            // Issue the request to the router
            this.requestHandler(req, res);
        });
    }


    /**
     * After the event emitters are mocked, the functional-test-async bit will
     * set the mock HTTP object on here.
     *
     * @param {nodeMocksHttp} nodeMocksHttp
     */
    setNodeMocksHttp(nodeMocksHttp) {
        this.nodeMocksHttp = nodeMocksHttp;
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

        if (!this.getHeader(options.headers, "Content-Type")) {
            options.headers["Content-Type"] = "application/octet-stream";
        }

        dateString = new Date().toISOString();
        options.headers["X-OpenToken-Date"] = dateString;

        if (options.body) {
            options.body = this.coerseToBuffer(options.body);

            if (!options.method) {
                options.method = "POST";
            }
        } else {
            options.body = Buffer.from("", "binary");
        }

        queryString = options.url.split("?");
        path = queryString.shift();
        queryString = queryString.join("?");

        // Build the signing content as a big buffer
        signingContent = [
            options.method.toUpperCase(),
            path,
            queryString,
            `host:${this.getHeader(options.headers, "Host").toLowerCase()}`,
            `content-type:${this.getHeader(options.headers, "Content-Type")}`,
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
