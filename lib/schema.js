"use strict";
/**
 * Manages the schemas we have loaded and validation for checking
 * data against those schemas.
 *
 * The schemas should have the `id` property set so when adding them
 * to the list of schemas they can automatically be mapped.
 */

module.exports = function (fs, nodeValidator, promise, tv4) {
    fs = promise.promisifyAll(fs);
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
            throw new Error("Unble to parse file: " + schema);
        }).then((schemaObject) => {
            if (! schemaObject.id) {
                throw new Error("Schema did not contain id: " + schema);
            }

            tv4.addSchema(schemaObject);
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
        return fs.readdirAsync(path).then((files) => {
            var i, getSchemas;

            getSchemas = [];

            for (i = 0; i < files.length; i += 1) {
                getSchemas.push(loadSchemaAsync(path + files[i]));
            }

            return promise.all(getSchemas);
        });
    }


    /**
     * Validates data against a schema available.
     * If the data doesn't validate against the schema an
     * object with details about why it didn't validate
     * will be returned.
     *
     * @param {*} data
     * @param {string} schema
     * @return {boolean} whether the data validated
     */
    function validate (data, schema) {
        return tv4.validate(data, schema, true, true);
    }

    return {
        loadSchemaAsync: loadSchemaAsync,
        loadSchemaFolderAsync: loadSchemaFolderAsync,
        validate: validate
    };
};