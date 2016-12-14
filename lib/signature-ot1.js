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
 * @typedef {Object} validateSignatureMiddleware~parsedHeader
 * @prop {string} method "OT1-HMAC-SHA256-HEX"
 * @prop {string} accessCode
 * @prop {Array.<string>} signedHeaders
 * @prop {string} signature
 */

/**
 * @typedef {Object} validateSignatureMiddleware~signatureDescription
 * @property {string} algorithm Key generation algorithm
 * @property {string} encoding How the resulting signature is encoded
 * @property {string} method How the key is generated (HMAC)
 * @property {string} signature The trimmed and standardized signature
 * @property {string} type Signature type (OT1)
 */

/**
 * @typedef {Object} opentoken~signatureOt1
 * @property {Function} authenticateAsync
 */

/**
 * @param {opentoken~accessCodeManager} accessCodeManager
 * @param {opentoken~binaryBuffer} binaryBuffer
 * @param {opentoken~ErrorResponse} ErrorResponse
 * @param {opentoken~hash} hash
 * @param {opentoken~promise} promise
 * @param {opentoken~util} util
 * @return {opentoken~signatureOt1}
 */
module.exports = (accessCodeManager, binaryBuffer, ErrorResponse, hash, promise, util) => {
    /**
     * Builds the large string to sign.
     *
     * @param {Restify~Request} req
     * @param {Array.<string>} signedHeaders
     * @return {string}
     */
    function buildSigningContent(req, signedHeaders) {
        var headerName, i, result, value;

        result = [
            req.method,
            req.getPath(),
            req.getQuery()
        ];

        for (i = 0; i < signedHeaders.length; i += 1) {
            headerName = signedHeaders[i];
            value = req.headers[headerName].trim();

            if (headerName === "host") {
                // The Host header must be changed to lowercase because
                // DNS is case insensitive.
                value = value.toLowerCase();
            }

            result.push(`${headerName}:${value}`);
        }

        result.push("");

        if (req.body) {
            result.push(binaryBuffer.toString(req.body));
        } else {
            result.push("");
        }

        return result.join("\n");
    }


    /**
     * Make sure the signature header attributes have exactly the items
     * we require for this version of a signature.  Rejected promises
     * return ErrorResponse objects.
     *
     * @param {Object} kvPairs Acts like a map of key/values.
     * @return {Promise.<*>}
     */
    function checkSignatureAttributesAsync(kvPairs) {
        var kvPairKeys, missing, requiredAttributes;

        kvPairKeys = Object.keys(kvPairs);
        requiredAttributes = [
            "access-code",
            "signature",
            "signed-headers"
        ];

        missing = util.arrayRequireItems(kvPairKeys, requiredAttributes);

        if (missing.length) {
            return ErrorResponse.rejectedPromiseAsync(`Missing required attributes: ${missing.join(", ")}`, "IHyLdqig");
        }

        missing = util.arrayRequireItems(requiredAttributes, kvPairKeys);

        if (missing.length) {
            return ErrorResponse.rejectedPromiseAsync(`Prohibited extra attributes: ${missing.join(", ")}`, "iqpoGKJk");
        }

        return promise.resolve();
    }


    /**
     * We only allow one method, algorithm and encoding.  Rejected promises
     * provide an ErrorResponse object.
     *
     * @param {validateSignatureMiddleware~signatureDescription} signatureDesc
     * @return {Promise.<*>}
     */
    function checkSignatureDescriptionAsync(signatureDesc) {
        // We can skip type and signature.  Only focus on these three
        // attributes.
        if (signatureDesc.method !== "HMAC") {
            return ErrorResponse.rejectedPromiseAsync(`Prohibited method, only HMAC allowed: ${signatureDesc.method}`, "X3A8VmGT");
        }

        if (signatureDesc.algorithm !== "SHA256") {
            return ErrorResponse.rejectedPromiseAsync(`Prohibited algorithm, only SHA256 allowed: ${signatureDesc.algorithm}`, "QpEMHUg5");
        }

        if (signatureDesc.encoding !== "HEX") {
            return ErrorResponse.rejectedPromiseAsync(`Prohibited encoding, only HEX allowed: ${signatureDesc.encoding}`, "B7q03SsU");
        }

        return promise.resolve();
    }


    /**
     * Checks that the list of signed headers includes at least the ones
     * we are interested in receiving.  Rejected promises result in an
     * ErrorResponse object.
     *
     * @param {Array.<string>} signedHeaders
     * @return {Promise.<*>}
     */
    function checkSignedHeadersAsync(signedHeaders) {
        var missing;

        missing = util.arrayRequireItems(signedHeaders, [
            "content-type",
            "host",
            "x-opentoken-date"
        ]);

        if (missing.length) {
            return ErrorResponse.rejectedPromiseAsync(`Signed header list (${signedHeaders.join(", ")}) is missing required headers: ${missing.join(", ")}`, "6I5IliIZ");
        }

        return promise.resolve();
    }


    /**
     * Retrieves the private key from the accessCodeManager.  Rejected
     * promises are provided an ErrorResponse object.
     *
     * @param {string} accountId
     * @param {string} accessCode
     * @return {Promise.<string>}
     */
    function getPrivateKeyAsync(accountId, accessCode) {
        return accessCodeManager.getAsync(accountId, accessCode).then((record) => {
            return record.secret;
        }, () => {
            return ErrorResponse.rejectedPromiseAsync("Invalid account ID or access code.", "76rEUePY");
        });
    }


    /**
     * Checks the signature provided and makes sure it matches what we
     * expect to see.  Rejected promises are given an ErrorResponse object.
     *
     * @param {string} content
     * @param {string} signatureFromClient
     * @param {string} privateKey
     * @return {Promise.<*>}
     */
    function checkSignatureAsync(content, signatureFromClient, privateKey) {
        var expectedSignature;

        expectedSignature = hash.hmac(content, {
            algorithm: "sha256",
            encoding: "hex",
            secret: privateKey
        });

        if (!hash.compare(expectedSignature, signatureFromClient)) {
            return ErrorResponse.rejectedPromiseAsync("Signature verification mismatch.", "k6JoBvzV");
        }

        return promise.resolve();
    }


    /**
     * Removes headers from the request object when they are not in the
     * list of allowed headers.
     *
     * @param {Restify~Request} req
     * @param {Array.<string>} allowedHeaders
     */
    function filterRequestHeaders(req, allowedHeaders) {
        var filtered;

        filtered = {};
        allowedHeaders.forEach((key) => {
            filtered[key] = req.headers[key];
        });
        req.headers = filtered;
    }


    /**
     * Verify an OT1 signature.  Rejected promises return an ErrorResponse
     * object.
     *
     * @param {Restify~Request} req
     * @param {validateSignatureMiddleware~signatureDescription} signatureDesc
     * @param {Object} kvPairs
     * @return {Promise.<*>}
     */
    function authenticateAsync(req, signatureDesc, kvPairs) {
        var signedHeaders;

        return checkSignatureDescriptionAsync(signatureDesc).then(() => {
            return checkSignatureAttributesAsync(kvPairs);
        }).then(() => {
            // Sanitize the signed headers and convert to an array, then
            // ensure our minimum standard for headers is included in the
            // signature.
            signedHeaders = kvPairs["signed-headers"].toLowerCase().trim().split(/ +/);

            return checkSignedHeadersAsync(signedHeaders);
        }).then(() => {
            return getPrivateKeyAsync(req.params.accountId, kvPairs["access-code"]);
        }).then((privateKey) => {
            var signingContent;

            signingContent = buildSigningContent(req, signedHeaders);

            return checkSignatureAsync(signingContent, kvPairs.signature, privateKey);
        }).then(() => {
            return filterRequestHeaders(req, signedHeaders);
        });
    }


    return {
        authenticateAsync
    };
};
