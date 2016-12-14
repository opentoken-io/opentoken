/**
 * Assign a random ID to the request.
 *
 * Use this as middleware in your route files.
 */

"use strict";

module.exports = (config, logger, random) => {
    var idLength;


    /**
     * Log a message for the request.  Makes sure the log entry is
     * prefixed with the log ID and a date/time stamp.
     *
     * @param {string} message
     * @this {restify~Request}
     */
    function logMessage(message) {
        var d;

        d = new Date();
        logger.info(`${this.logId} ${d.toISOString()} ${message}`);
    }


    idLength = config.server.requestIdLength;

    /**
     * Specify the schema file to validate the incoming request against.
     *
     * @param {string} schemaPath Validation and processing of body.
     * @return {Function} middleware
     */
    return () => {
        return (req, res, next) => {
            req.log = logMessage;
            random.idAsync(idLength).then((id) => {
                req.logId = id;
                next();
            }, next);
        };
    };
};
