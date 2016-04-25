"use strict";

module.exports = function (fs, nodeValidator, promise, tv4) {
    fs = promise.promisifyAll(fs);
    tv4 = tv4.freshApi();
    tv4.addFormat("email", nodeValidator.isEmail.bind(nodeValidator));

    return {
        /**
         * Loads a schema from a directory or URL and adds
         * it to the list of schemas available for validation.
         *
         * @param {string} path
         * @param {string} schema
         * @return {Promise}
         */
        loadSchemaAsync: (location, schema) => {
            return fs.readFileAsync(location).then((contents) => {
                tv4.addSchema(schema, contents.toString());
            });
        },

        /**
         * Loads a directory of schemas and adds them to the
         * list of schemas available for validation.
         *
         * @param {string} path
         * @return {Promise}
         */
        loadSchemaFolderAsync: (path) => {
            return fs.readdirAsync(path).then((files) => {
                var fileContents, i, getSchemas, fileName;

                getSchemas = [];
                for (i = 0; i < files.length; i = i + 1) {
                    fileName = files[i].replace(".json", "");
                    getSchemas.push(fs.readFileAsync(path + files[i]).then((contents) => {
                        fileContents = JSON.parse(contents.toString());
                        tv4.addSchema(fileName, fileContents);
                    })
                    );
                }

                return promise.all(getSchemas).then((result) => {
                    return tv4.getSchemaMap();
                });
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
         * @return {(boolean|Object)} whether the data validated
         */
        validate: (data, schema) => {
            return tv4.validate(data, schema, true, true);
        }
    };
};