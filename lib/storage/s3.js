"use strict";

module.exports = function (awsSdk, promise) {
    class S3 {
        constructor(config) {
            this.config = {};
            this.configure(config);
            this.awsS3 = null;
        }


        /**
         * Configures options for AWS.
         *
         * @param {Object} config
         * @return {Object} this
         */
        configure(config) {
            if (!config || typeof config !== "object") {
                config = {};
            }

            awsSdk.config.region = config.region || "us-east-1";
            this.config.bucket = config.bucket || null;

            return this;
        }


        /**
         * Deletes a single file from configured bucket.
         *
         * @param {string} filename
         * @return {Promise.<*>} promise
         */
        delAsync(filename) {
            return this.transit().deleteObjectAsync({
                Key: filename
            });
        }


        /**
         * Gets a file from S3 from the configured bucket.
         *
         * @param {string} filename
         * @return {Promise.<Buffer>} indicates success/error of operation
         */
        getAsync(filename) {
            return this.transit().getObjectAsync({
                Key: filename
            }).then((response) => {
                return response.Body;
            });
        }


        /**
         * Gets a list of files and "directories" from S3.
         *
         * S3 stores the data in an "object" structure which
         * will create psuedo directories.
         * By passing in a prefix with slash will allow one to
         * navigate the objects as if they are directories.
         *
         *    Object in S3
         *    accounts/person1/information
         *
         * Passing in the prefix accounts/person1
         * would send back the entire object accounts/person1/information
         * as your data.
         *
         * @param {string} prefix
         * @return {Promise.<*>} indicates success/error of operation
         */
        listAsync(prefix) {
            return this.transit().listObjectsAsync({
                Prefix: prefix || null
            });
        }


        /**
         * Uploads a file to the S3 bucket configured.
         * We always want the data to be a buffer type
         * in binary.
         *
         * Passing in contents with slashes will make the object
         * on S3 look and behave like a directory.
         *
         * @param {string} filename
         * @param {(Buffer|string)} contents
         * @param {Object} options
         * @return {Promise.<*>} indicates success/error of operation
         */
        putAsync(filename, contents, options) {
            var params;

            if (typeof contents === "string") {
                contents = new Buffer(contents, "binary");
            }

            params = {
                Body: contents,
                ContentType: "application/octet-stream",
                Key: filename,
                ServerSideEncryption: "AES256"
            };

            if (options && typeof options === "object") {
                params.ContentType = options.contentType || params.ContentType;
                params.Expires = options.expires || null;
            }

            return this.transit().putObjectAsync(params);
        }


        /**
         * Creates the S3 bucket we need for subsequent calls.  Not intended
         * for general consumption; do not use this from outside the class
         * unless it is required for testing.
         *
         * @return {Object} awsS3
         */
        transit() {
            if (! this.awsS3) {
                this.awsS3 = new awsSdk.S3({
                    params: {
                        Bucket: this.config.bucket
                    }
                });

                this.awsS3 = promise.promisifyAll(this.awsS3);
            }

            return this.awsS3;
        }
    }

    return S3;
};
