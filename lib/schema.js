"use strict";
/**
 * Manages the schemas we have loaded and validation for checking
 * data against those schemas.
 *
 * The schemas should have the id property set so when adding them
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

    return {
        /**
         * Loads a schema from a directory or URL and adds
         * it to the list of schemas available for validation.
         *
         * @param {string} path
         * @param {string} schema
         * @return {Promise.<*>}
         */
        loadSchemaAsync: (schema) => {
            return fs.readFileAsync(schema).then((contents) => {
                tv4.addSchema(JSON.parse(contents.toString()));
            });
        },


        /**
         * Loads a directory of schemas and adds them to the
         * list of schemas available for validation.
         *
         * @param {string} path
         * @return {Promise.<*>}
         */
        loadSchemaFolderAsync: (path) => {
            return fs.readdirAsync(path).then((files) => {
                var i, getSchemas;

                getSchemas = [];
                for (i = 0; i < files.length; i = i + 1) {
                    getSchemas.push(fs.readFileAsync(path + files[i]).then((contents) => {
                        tv4.addSchema(JSON.parse(contents.toString()));
                    })
                    );
                }

                return promise.all(getSchemas);
            });
        },


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
        validate: (data, schema) => {
            return tv4.validate(data, schema, false, true);
        }
    };
};