/**
 * Finish configuration, load necessary files, and perform other
 * asynchronous tasks that are required for the software to run properly.
 */
module.exports = (config, path, promise, schema) => {
    function checkConfigBasic(baseDir) {
        if (typeof config !== "object" || !config) {
            throw new Error("Configuration is not an object");
        }

        if (typeof config.schemaPath !== "string") {
            throw new Error("config.schemaPath is not set to a string");
        }

        return path.resolve(baseDir, config.schemaPath);
    }

    function checkForMissingSchemas() {
        var missing;

        missing = schema.getMissingSchemas();

        if (missing.length) {
            throw new Error("Unresolved schema references: " + missing.join(", "));
        }
    }

    return (baseDir) => {
        return promise.try(() => {
            return checkConfigBasic(baseDir);
        }).then((schemaPath) => {
            return schema.loadSchemaFolderAsync(schemaPath + "/");
        }).then(() => {
            return checkForMissingSchemas();
        }).then(() => {
            var result;

            result = schema.validate(config, "/config/config");

            if (result) {
                throw new Error("Config did not validate: " + result.error.message + " " + result.error.dataPath + " " + result.error.schemaPath);
            }
        });
    };
};
