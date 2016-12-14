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

"use strict";

/**
 * @typedef {Object} validateSignatureMiddleware~signatureDescription
 * @property {string} algorithm Key generation algorithm
 * @property {string} encoding How the resulting signature is encoded
 * @property {string} method How the key is generated (HMAC)
 * @property {string} signature The trimmed and standardized signature
 * @property {string} type Signature type (OT1)
 */

/**
 * @param {opentoken~config} config
 * @param {opentoken~ErrorResponse} ErrorResponse
 * @param {opentoken~OtDate} OtDate
 * @param {opentoken~promise} promise
 * @param {opentoken~signatureOt1} signatureOt1
 * @return {Function} middleware factory
 */
module.exports = (config, ErrorResponse, OtDate, promise, signatureOt1) => {
    var dateWindowFuture, dateWindowPast, signatureHost, signatureLinkDefinition, signatureMethod;

    /**
     * Splits up the signature information into an object for easier
     * processing.  Rejects promises with an opentoken~ErrorResponse object.
     *
     * @param {string} signature
     * @return {Promise.<validateSignatureMiddleware~signatureDescription>}
     */
    function parseSignatureInformationAsync(signature) {
        var cleaned, split;

        cleaned = signature.trim().toUpperCase();
        split = cleaned.split("-");

        if (split.length !== 4) {
            return ErrorResponse.rejectedPromiseAsync("Invalid format of signature identifier.", "9iYNSNlY");
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
     * an object (used as a map).  Rejected promises will send
     * ErrorResponse objects.
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
                        return ErrorResponse.rejectedPromiseAsync("Invalid quoting in signature header", "pFDHKguh");
                    }

                    value += `;${chunks.shift()}`;
                }

                value = value.substr(1).replace(/" *$/, "");
            } else {
                // Trim whitespace only at the end.
                value = value.replace(/ *$/, "");
            }

            if (result[key]) {
                return ErrorResponse.rejectedPromiseAsync(`Duplicated attribute name in Authorized header: ${key}`, "QtlTT61E");
            }

            result[key] = value;
        }

        return promise.resolve(result);
    }


    /**
     * Parses the Authorized header and verifies the signature.
     * Rejected promises send back ErrorResponse objects.  That
     * also means functions from other modules must all return
     * ErrorResponse objects or this function needs to handle the
     * conversion.
     *
     * @param {Restify~Request} req
     * @param {string} headerValue
     * @return {Promise.<*>}
     */
    function authenticateSignatureAsync(req, headerValue) {
        var chunks, signatureChunk;

        // This works because semicolons are not allowed in the first
        // chunk.  Semicolons may appear in any of the key/value pairs
        // and that's handled in parseHeaderKeyValuePairsAsync().
        chunks = headerValue.split(";");
        signatureChunk = chunks.shift().trim();

        // Get the signature type, method, algorithm and encoding from
        // the first chunk.
        return parseSignatureInformationAsync(signatureChunk).then((signatureInfo) => {
            // Parse the rest of the chunks into key/value pairs
            return parseHeaderKeyValuePairsAsync(chunks).then((kvPairs) => {
                switch (signatureInfo.type) {
                case "OT1":
                    return signatureOt1.authenticateAsync(req, signatureInfo, kvPairs);

                default:
                    return ErrorResponse.rejectedPromiseAsync("Invalid signature method in Authorized header.", "2HqEQm0k");
                }
            });
        });
    }


    /**
     * Validate the host header.  This helps to make sure the client
     * believes it is connecting to us instead of another party.  The
     * host header is required in signatures as well, but that part is
     * checked later.  Rejected promises will always be provided an
     * ErrorResponse object.
     *
     * @param {string} hostHeader
     * @return {Promise.<*>}
     */
    function verifyHostHeaderAsync(hostHeader) {
        if (!hostHeader) {
            return ErrorResponse.rejectedPromiseAsync("Missing a required header: Host", "VoFPGjHe");
        }

        // Hosts are converted to lowercase because DNS is case-insensitive.
        hostHeader = hostHeader.toLowerCase();

        if (hostHeader !== signatureHost) {
            return ErrorResponse.rejectedPromiseAsync(`The host header did not match.  Required: ${signatureHost}, Actual: ${hostHeader}`, "eBwqsCeZ");
        }

        return promise.resolve();
    }


    /**
     * Ensure the X-OpenToken-Date header exists and the time is not
     * more than a specific allowed lifetime for a request.  Rejected
     * promises will be provided an ErrorResponse object.
     *
     * @param {string} dateHeader
     * @return {Promise.<*>}
     */
    function verifyXOpenTokenDateHeaderAsync(dateHeader) {
        var currentDate, requestDate;

        if (!dateHeader) {
            return ErrorResponse.rejectedPromiseAsync("Missing an X-OpenToken-Date header.", "B766z1D2");
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
                return ErrorResponse.rejectedPromiseAsync("The X-OpenToken-Date header is in the future.", "uYom0uhM");
            }

            if (requestDate.plus(dateWindowPast).isBefore(currentDate)) {
                return ErrorResponse.rejectedPromiseAsync("The X-OpenToken-Date header is too far in the past.", "JzFzaWPt");
            }

            return true;
        });
    }


    /**
     * Compares a message signature against the request.  Fails if the
     * signature is invalid.  If `allowUnsigned` is not truthy, fails if
     * there is no Authorized header.  If the promise is rejected, an
     * ErrorResponse object is provided.
     *
     * @param {Restify~Request} req
     * @param {boolean} allowUnsigned
     * @return {Promise.<boolean>} true if this is a signed request
     */
    function authenticateAsync(req, allowUnsigned) {
        // Take care of requests without the Authorization header
        if (!req.headers.authorization) {
            if (allowUnsigned) {
                return promise.resolve(false);
            }

            return ErrorResponse.rejectedPromiseAsync("A signed message is required.", "0FLNjTwn");
        }

        // The header exists.  Authenticate the Host header, the
        // X-OpenToken-Date header and finally the signature.
        return verifyHostHeaderAsync(req.headers.host).then(() => {
            return verifyXOpenTokenDateHeaderAsync(req.headers["x-opentoken-date"]);
        }).then(() => {
            return authenticateSignatureAsync(req, req.headers.authorization);
        }).then(() => {
            // Indicate this is a signed request.
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
                res.contentType = error.mimeType();
                res.header("WWW-Authenticate", signatureMethod);
                res.links(signatureLinkDefinition);
                res.send(401, error);

                return next(false);
            });
        };
    };
};
