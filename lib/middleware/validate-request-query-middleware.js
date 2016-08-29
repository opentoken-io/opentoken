"use strict";

/**
 * Parse an incoming request and validate that the query matches a schema.
 *
 * Use this as middleware in your route files.
 */

module.exports = (chainMiddleware, restifyPlugins, schema) => {
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
            if (!req.query || schema.validate(req.query, schemaPath)) {
                // This does not go to the client, but it should.
                // https://github.com/opentoken-io/opentoken/issues/96
                res.send(400, new Error(`Query parameters did not validate against schema: ${schemaPath}`));
            }

            return next();
        });
    };
};
