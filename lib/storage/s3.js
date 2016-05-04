"use strict";

/**
 * Handles the functionality between OpenToken.io and
 * Amazon S3. We explicitly say how we are communicating
 * and what functions are open to use.
 *
 * All methods are asychronous.
 */

/**
 * The configuration object from used to set up where the storage
 * is located in S3 and which region to use.
 *
 * @typeDef {Object} s3~configOptions
 * @property {string} bucket
 * @property {string} region
 */

module.exports = function (awsSdk, config, promise) {
    var awsS3, s3Bucket;

    awsS3 = null;
    s3Bucket = null;
    configure(config.storage.s3);

    /**
     * Configures options for AWS.
     *
     * @param {s3~configOptions} config
     */
    function configure(config) {
        awsSdk.config.region = config.region;
        s3Bucket = config.bucket;
    }


    /**
     * Deletes a single file from configured bucket.
     *
     * @param {string} filename
     * @return {Promise.<*>} promise
     */
    function delAsync(filename) {
        return transit().deleteObjectAsync({
            Key: filename
        });
    }


    /**
     * Gets a file from S3 from the configured bucket.
     *
     * @param {string} filename
     * @return {Promise.<Buffer>} indicates success/error of operation
     */
    function getAsync(filename) {
        return transit().getObjectAsync({
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
    function listAsync(prefix) {
        return transit().listObjectsAsync({
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
    function putAsync(filename, contents, options) {
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

        return transit().putObjectAsync(params);
    }


    /**
     * Creates the S3 bucket we need for subsequent calls.
     * Not normally used outside the class, but exposed for
     * testing.
     *
     * @return {Object} awsS3
     */
    function transit() {
        if (! awsS3) {
            awsS3 = new awsSdk.S3({
                params: {
                    Bucket: s3Bucket
                }
            });

            awsS3 = promise.promisifyAll(awsS3);
        }

        return awsS3;
    }

    return {
        delAsync: delAsync,
        getAsync: getAsync,
        listAsync: listAsync,
        putAsync: putAsync,
        transit: transit
    };
};
