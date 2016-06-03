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
     * @param {string} schemaPath
     * @return {Array} middleware
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
            if (schema.validate(req.body, schemaPath)) {
                res.send(400, new Error(`Did not validate against schema: ${schemaPath}`));

                return next(false);
            }

            return next();
        });
    };
};
