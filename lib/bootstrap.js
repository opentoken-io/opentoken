"use strict";

/**
 * Finish configuration, load necessary files, and perform other
 * asynchronous tasks that are required for the software to run properly.
 */

module.exports = (config, path, promise, schema) => {
    /**
     * Ensures the configuration is an object and that the schema path
     * is set up correctly.  Returns the schema path to use for loading
     * schemas so the rest of the config can be validated.
     *
     * @param {string} baseDir Used instead of __dirname
     * @return {string}
     * @throws {Error} when configuration is wrong
     */
    function checkConfigBasic(baseDir) {
        if (typeof config !== "object" || !config) {
            throw new Error("Configuration is not an object");
        }

        if (typeof config.schemaPath !== "string") {
            throw new Error("config.schemaPath is not set to a string");
        }

        return path.resolve(baseDir, config.schemaPath);
    }


    /**
     * Checks for missing schemas
     *
     * @throws {Error} when schemas are missing.
     */
    function checkForMissingSchemas() {
        var missing;

        missing = schema.getMissingSchemas();

        if (missing.length) {
            throw new Error(`Unresolved schema references: ${missing.join(", ")}`);
        }
    }

    return () => {
        var baseDir;

        baseDir = path.resolve(__dirname, "..");

        return promise.try(() => {
            return checkConfigBasic(baseDir);
        }).then((schemaPath) => {
            return schema.loadSchemaFolderAsync(schemaPath);
        }).then(() => {
            return checkForMissingSchemas();
        }).then(() => {
            var result;

            result = schema.validate(config, "/config/config.json");

            if (result) {
                throw new Error(`Config did not validate: ${result.error.message} ${result.error.dataPath} ${result.error.schemaPath}`);
            }
        }).then(() => {
            config.baseDir = baseDir;
        });
    };
};
