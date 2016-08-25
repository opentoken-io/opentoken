"use strict";

/**
 * Parse an incoming request and validate that the body matches a schema.
 *
 * Use this as middleware in your route files.
 */

module.exports = (chainMiddleware, restifyPlugins, schema) => {
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
            if (!req.body || schema.validate(req.body, schemaPath)) {
                // This does not go to the client, but it should.
                // https://github.com/opentoken-io/opentoken/issues/96
                res.send(400, new Error(`Body did not validate against schema: ${schemaPath}`));

                return next(false);
            }

            return next();
        });
    };
};
