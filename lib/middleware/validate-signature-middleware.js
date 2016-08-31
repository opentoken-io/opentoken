"use strict";

/**
 * Look at the Authorization header and verify the message signature.
 *
 * If the request is allowed to continue, the request object will have
 * either `req.signed === true` or `req.signed === false`.  Any error
 * validating the signature will send a 401 Unauthorized header as well
 * as a link to a document explaining about the signatures.
 *
 * Use this as middleware in your route files.
 */

/**
 * @typedef {Object} validateSignatureMiddleware~signatureDescription
 * @property {string} algorithm Key generation algorithm
 * @property {string} encoding How the resulting signature is encoded
 * @property {string} method How the key is generated (HMAC)
 * @property {string} signature The trimmed and standardized signature
 * @property {string} type Signature type (OT1)
 */

module.exports = (config, errorResponse, OtDate, promise, signatureOt1) => {
    var dateWindowFuture, dateWindowPast, signatureHost, signatureLinkDefinition, signatureMethod;

    /**
     * Splits up the signature information into an object for easier
     * processing.
     *
     * @param {string} signature
     * @return {Promise.<validateSignatureMiddleware~signatureDescription>}
     */
    function parseSignatureInformationAsync(signature) {
        var cleaned, split;

        cleaned = signature.trim().toUpperCase();
        split = cleaned.split("-");

        if (split.length !== 4) {
            return errorResponse.rejectedPromiseAsync("Invalid format of signature identifier.", "9iYNSNlY");
        }

        return promise.resolve({
            algorithm: split[2],
            encoding: split[3],
            method: split[1],
            signature: cleaned,
            type: split[0]
        });
    }


    /**
     * Transforms an array of fields similar to ` key="value" ` into
     * an object (used as a map).
     *
     * @param {Array.<string>} chunks
     * @return {Promise.<Object>}
     */
    function parseHeaderKeyValuePairsAsync(chunks) {
        var key, result, value;

        result = {};

        while (chunks.length) {
            value = chunks.shift().split("=");
            key = value.shift().trim();
            value = value.join("=");

            if (value.charAt(0) === "\"") {
                // If the value is quoted, we look for the end of the
                // quotes and may consume more chunks until we get the
                // end.  The next non-whitespace character after the
                // quotes must be a semicolon, so if we run out of
                // chunks and still can't find a quote then we have an
                // invalid HTTP header value.
                while (!value.match(/" *$/)) {
                    if (!chunks.length) {
                        return errorResponse.rejectedPromiseAsync("Invalid quoting in signature header", "pFDHKguh");
                    }

                    value += `;${chunks.shift()}`;
                }

                value = value.substr(1).replace(/" *$/, "");
            } else {
                // Trim whitespace at the end.
                value = value.replace(/ *$/, "");
            }

            if (result[key]) {
                return errorResponse.rejectedPromiseAsync(`Duplicated attribute name in Authorized header: ${key}`, "QtlTT61E");
            }

            result[key] = value;
        }

        return promise.resolve(result);
    }


    /**
     * Parses the Authorized header and verifies the signature
     *
     * @param {Restify~Request} req
     * @param {string} headerValue
     * @return {Promise.<*>}
     */
    function authenticateSignatureAsync(req, headerValue) {
        var chunks;

        // This works because semicolons are not allowed in the first
        // chunk.  Semicolons may appear in any of the key/value pairs
        // and that's handled in parseHeaderKeyValuePairs().
        chunks = headerValue.split(";");

        // Get the signature type, method, algorithm and encoding from
        // the first chunk.
        return parseSignatureInformationAsync(chunks.shift().trim()).then((signatureInfo) => {
            // Parse the rest of the chunks into key/value pairs
            return parseHeaderKeyValuePairsAsync(chunks).then((kvPairs) => {
                switch (signatureInfo.type) {
                case "OT1":
                    return signatureOt1.authenticateAsync(req, signatureInfo, kvPairs);

                default:
                    return errorResponse.rejectedPromiseAsync("Invalid signature method in Authorized header.", "2HqEQm0k");
                }
            });
        });
    }


    /**
     * Validate the host header.  This helps to make sure the client
     * believes it is connecting to us instead of another party.  The
     * host header is required in signatures as well, but that part is
     * checked later.
     *
     * @param {string} hostHeader
     * @return {Promise.<*>}
     */
    function verifyHostHeaderAsync(hostHeader) {
        if (!hostHeader) {
            return errorResponse.rejectedPromiseAsync("Missing a required header: Host", "VoFPGjHe");
        }

        // Hosts are converted to lowercase because DNS is case-insensitive.
        hostHeader = hostHeader.toLowerCase();

        if (hostHeader !== signatureHost) {
            return errorResponse.rejectedPromiseAsync(`The host header did not match.  Required: ${signatureHost}, Actual: ${hostHeader}`, "eBwqsCeZ");
        }

        return promise.resolve();
    }


    /**
     * Ensure the X-OpenToken-Date header exists and that the time is not
     * more than a specific allowed lifetime for a request.
     *
     * @param {string} dateHeader
     * @return {Promise.<*>}
     */
    function verifyXOpenTokenDateHeaderAsync(dateHeader) {
        var currentDate, requestDate;

        if (!dateHeader) {
            return errorResponse.rejectedPromiseAsync("Missing an X-OpenToken-Date header.", "B766z1D2");
        }

        return promise.try(() => {
            requestDate = OtDate.fromString(dateHeader);
            currentDate = OtDate.now();

            // Allow a window of `lifetime` around currentDate.  We can
            // test for this by ensuring these two things:
            //
            //     requestDate < currentDate + dateWindowFuture
            //         Otherwise it is too far in the future
            //     requestDate > currentDate - dateWindowPast
            //         Otherwise it is too far in the past
            //
            // To make it work with OtDate, we change the second condition
            // to look like this:
            //
            //     requestDate + dateWindowPast > currentDate
            if (currentDate.plus(dateWindowFuture).isBefore(requestDate)) {
                return errorResponse.rejectedPromiseAsync("The X-OpenToken-Date header is in the future.", "uYom0uhM");
            }

            if (requestDate.plus(dateWindowPast).isBefore(currentDate)) {
                return errorResponse.rejectedPromiseAsync("The X-OpenToken-Date header is too far in the past.", "JzFzaWPt");
            }

            return true;
        });
    }


    /**
     * Compares a message signature against the request.  Fails if the
     * signature is invalid.  If `allowUnsigned` is not truthy, fails if
     * there is no Authorized header.
     *
     * @param {Restify~Request} req
     * @param {boolean} allowUnsigned
     * @return {Promise.<boolean>} true if this is a signed request
     */
    function authenticateAsync(req, allowUnsigned) {
        // Take care of requests without the Authorized header
        if (!req.headers.authorized) {
            if (allowUnsigned) {
                return promise.resolve(false);
            }

            return errorResponse.rejectedPromiseAsync("A signed message is required.", "0FLNjTwn");
        }

        // The header exists.  Authenticate the Host header, the
        // X-OpenToken-Date header and finally the signature.
        return verifyHostHeaderAsync(req.headers.host).then(() => {
            return verifyXOpenTokenDateHeaderAsync(req.headers["x-opentoken-date"]);
        }).then(() => {
            return authenticateSignatureAsync(req, req.headers.authorized);
        }).then(() => {
            // Indicate that this is a signed request.
            return true;
        });
    }


    dateWindowFuture = config.signature.dateWindowFuture;
    dateWindowPast = config.signature.dateWindowPast;
    signatureHost = config.signature.host;
    signatureMethod = config.signature.method;
    signatureLinkDefinition = {
        related: {
            href: config.signature.relatedLink,
            title: "signature-information"
        }
    };

    /**
     * Middleware that calls authenticate and then either signals that
     * the request is signed or else indicates the error and prevents
     * future middleware from running.
     *
     * @param {boolean} [allowUnsigned=false]
     * @return {Function} middleware
     */
    return (allowUnsigned) => {
        return (req, res, next) => {
            authenticateAsync(req, allowUnsigned).then((isSigned) => {
                req.signed = isSigned;
                next();
            }, (error) => {
                res.header("WWW-Authenticate", signatureMethod);
                res.links(signatureLinkDefinition);
                res.send(401, error);

                return next(false);
            });
        };
    };
};
