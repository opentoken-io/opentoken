"use strict";
/**
 * Manages the schemas we have loaded and validation for checking
 * data against those schemas.
 *
 * The schemas should have the `id` property set so when adding them
 * to the list of schemas they can automatically be mapped.
 */

module.exports = function (fs, glob, nodeValidator, promise, tv4) {
    var schemas, globAsync;

    schemas = new Map();
    fs.readFileAsync = promise.promisify(fs.readFile);
    globAsync = promise.promisify(glob);
    tv4 = tv4.freshApi();
    tv4.addFormat("email", (data, schema) => {
        if (nodeValidator.isEmail(data)) {
            return null;
        }

        return "Email did not validate";
    });


    /**
     * Loads a schema from a file and adds it to the list
     * of schemas available for validation.
     *
     * @param {string} schema
     * @return {Promise.<*>}
     */
    function loadSchemaAsync (schema) {
        return fs.readFileAsync(schema).then((contents) => {
            return JSON.parse(contents.toString("utf-8"));

        }).then(null, () => {
            throw new Error("Unable to parse file: " + schema);
        }).then((schemaObject) => {
            if (! schemaObject.id) {
                throw new Error("Schema did not contain id: " + schema);
            }

            tv4.addSchema(schemaObject);
            schemas.set(schemaObject.id, schemaObject);
        });
    }


    /**
     * Loads a directory of schemas and adds them to the
     * list of schemas available for validation.
     *
     * @param {string} path
     * @return {Promise.<*>}
     */
    function loadSchemaFolderAsync (path) {
        return globAsync(path, {
            strict: true,
            nodir: true
        }).then((files) => {
            return promise.all(files.map(loadSchemaAsync));
        });
    }


    /**
     * Validates data against a schema available.
     * If the schema isn't mapped we will throw an error.
     *
     * @param {*} data
     * @param {string} schema
     * @return {boolean} whether the data validated
     */
    function validate (data, schema) {
        if (! schemas.has(schema)) {
            throw new Error("Schema is not loaded: " + schema);
        }

        return tv4.validate(data, schema, true, true);
    }

    return {
        loadSchemaAsync: loadSchemaAsync,
        loadSchemaFolderAsync: loadSchemaFolderAsync,
        validate: validate
    };
};