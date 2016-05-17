"use strict";
/**
 * Manages the schemas we have loaded and validation for checking
 * data against those schemas.
 *
 * The schemas should have the `id` property set so when adding them
 * to the list of schemas they can automatically be mapped.
 */

/**
 * Describes problems encountered during validation.
 *
 * @typedef {Object} schema~validationProblems
 * @property {boolean} valid Always set to false
 * @property {Array.<Object>} errors
 * @property {Array.<string>} missing
 */

module.exports = (fs, glob, nodeValidator, promise, tv4) => {
    var schemasLoaded, globAsync;

    schemasLoaded = {};
    fs.readFileAsync = promise.promisify(fs.readFile);
    globAsync = promise.promisify(glob);
    tv4 = tv4.freshApi();
    tv4.addFormat("email", (data) => {
        if (nodeValidator.isEmail(data)) {
            return null;
        }

        return "Email did not validate";
    });


    /**
     * Returns a list of missing schema URIs.
     *
     * @return {Array.<string>}
     */
    function getMissingSchemas() {
        return tv4.getMissingUris();
    }


    /**
     * Loads a schema from a file and adds it to the list
     * of schemas available for validation.
     *
     * @param {string} schema
     * @param {string} relativeTo
     * @return {Promise.<*>}
     * @throws {Error} when a schema ID conflicts
     */
    function loadSchemaAsync(schema, relativeTo) {
        return fs.readFileAsync(schema).then((contents) => {
            return JSON.parse(contents.toString("utf-8"));
        }).then(null, () => {
            throw new Error("Unable to parse file: " + schema);
        }).then((schemaObject) => {
            var id;

            id = schema.replace(relativeTo, "").replace(/\.json$/, "");

            if (id.charAt(0) != "/") {
                id = "/" + id;
            }

            if (schemaObject.id && schemaObject.id !== id) {
                throw new Error("Schema had wrong ID: " + schema + " should have the id " + id);
            }

            schemaObject.id = id;
            tv4.addSchema(id, schemaObject);
            schemasLoaded[id] = true;
        });
    }


    /**
     * Loads a directory of schemas and adds them to the
     * list of schemas available for validation.
     *
     * @param {string} path that ends in a slash
     * @return {Promise.<*>}
     */
    function loadSchemaFolderAsync(path) {
        return globAsync(path + "**/*.json", {
            strict: true,
            nodir: true
        }).then((files) => {
            return promise.all(files.map((fullPath) => {
                return loadSchemaAsync(fullPath, path);
            }));
        });
    }


    /**
     * Validates data against a schema available.
     * If the schema isn't mapped we will throw an error.
     *
     * @param {*} data
     * @param {string} schema
     * @return {(null|schema~validationProblems)} null if it is ok
     */
    function validate(data, schema) {
        var result;

        if (! schemasLoaded[schema]) {
            throw new Error("Schema is not loaded: " + schema);
        }

        result = tv4.validateResult(data, schema);

        if (result.valid) {
            return null;
        }

        return result;
    }

    return {
        getMissingSchemas: getMissingSchemas,
        loadSchemaAsync: loadSchemaAsync,
        loadSchemaFolderAsync: loadSchemaFolderAsync,
        validate: validate
    };
};
