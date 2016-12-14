/**
 * Parse an incoming request and validate that the body matches a schema.
 *
 * Use this as middleware in your route files.
 */

"use strict";

/**
 * @param {opentoken~chainMiddleware} chainMiddleware
 * @param {opentoken~ErrorResponse} ErrorResponse
 * @param {restifyPlugins} restifyPlugins
 * @param {opentoken~schema} schema
 * @return {Function}
 */
module.exports = (chainMiddleware, ErrorResponse, restifyPlugins, schema) => {
    /**
     * Specify the schema file to validate the incoming request against.
     *
     * @param {string} schemaPath Validation and processing of body.
     * @return {Function} middleware
     */
    return (schemaPath) => {
        return chainMiddleware(restifyPlugins.bodyParser({
            mapFiles: false,
            mapParams: false,
            maxBodySize: 4096,
            overrideParams: false,
            requestBodyOnGet: true,
            rejectUnknown: true
        }), (req, res, next) => {
            var error;

            if (!req.body || schema.validate(req.body, schemaPath)) {
                error = new ErrorResponse(`Body did not validate against schema: ${schemaPath}`, "j9ggGq9ZlA");
                res.contentType = error.mimeType();
                res.send(400, error);

                return next(false);
            }

            return next();
        });
    };
};
