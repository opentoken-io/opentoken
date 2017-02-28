/**
 * Parse an incoming request and validate that the query matches a schema.
 *
 * Use this as middleware in your route files.
 */

"use strict";

/**
 * @param {opentoken~chainMiddleware} chainMiddleware
 * @param {opentoken~ErrorResponse} ErrorResponse
 * @param {restifyPlugins} restifyPlugins
 * @param {tv4} tv4
 * @return {Function} middleware factory
 */
module.exports = (chainMiddleware, ErrorResponse, restifyPlugins, tv4) => {
    /**
     * Specify the schema file to validate the incoming request against.
     *
     * @param {string} schemaPath Validation and processing of query string.
     * @return {Function} middleware
     */
    return (schemaPath) => {
        return chainMiddleware(restifyPlugins.queryParser({
            mapParams: false
        }), (req, res, next) => {
            var error;

            if (!req.query || !tv4.validateResult(req.query, schemaPath).valid) {
                error = new ErrorResponse(`Query parameters did not validate against schema: ${schemaPath}`, "3I3rElpd1A");
                res.contentType = error.mimeType();
                res.send(400, error);

                return next(false);
            }

            return next();
        });
    };
};
