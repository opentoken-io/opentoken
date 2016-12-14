"use strict";

/**
 * Handles the functionality between OpenToken.io and
 * Amazon S3. We explicitly say how we are communicating
 * and what functions are open to use.
 *
 * All methods are asynchronous.
 */

/**
 * Options supported by all of the storage engine `put` methods.
 *
 * @typedef {Object} storage~putOptions
 * @property {string} [contentType]
 * @property {OtDate} [expires]
 */

/**
 * The configuration object from used to set up where the storage
 * is located in S3 and which region to use.
 *
 * @typedef {Object} s3~configOptions
 * @property {string} bucket
 * @property {string} region
 */

module.exports = (awsSdk, config, promise) => {
    var awsS3, s3Config;

    /**
     * Creates the S3 bucket we need for subsequent calls.
     * Not normally used outside the class, but exposed for
     * testing.
     *
     * @return {Object} awsS3
     */
    function transit() {
        if (!awsS3) {
            awsS3 = new awsSdk.S3(s3Config);
            awsS3 = promise.promisifyAll(awsS3);
        }

        return awsS3;
    }

    /**
     * Deletes a single file from configured bucket.
     *
     * @param {string} filename
     * @return {Promise.<*>} promise
     */
    function deleteAsync(filename) {
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
     * Uploads a file to the S3 bucket configured.
     * We always want the data to be a buffer type
     * in binary.
     *
     * Passing in contents with slashes will make the object
     * on S3 look and behave like a directory.
     *
     * @param {string} filename
     * @param {(Buffer|string)} contents
     * @param {storage~putOptions} [options]
     * @return {Promise.<*>} indicates success/error of operation
     */
    function putAsync(filename, contents, options) {
        var params;

        if (typeof contents === "string") {
            contents = new Buffer(contents, "binary");
        }

        params = {
            Body: contents,
            Key: filename
        };

        if (options && typeof options === "object") {
            params.ContentType = options.contentType || params.ContentType;
            params.Expires = options.expires || null;
        }

        return transit().putObjectAsync(params);
    }


    awsS3 = null;
    s3Config = {
        accessKeyId: config.storage.s3.accessKeyId,
        params: {
            Bucket: config.storage.s3.bucket,
            ContentType: "application/octet-stream",
            ServerSideEncryption: "AES256"
        },
        region: config.storage.s3.region,
        secretAccessKey: config.storage.s3.secretAccessKey
    };

    if (s3Config.accessKeyId === "") {
        delete s3Config.accessKeyId;
    }

    if (s3Config.secretAccessKey === "") {
        delete s3Config.secretAccessKey;
    }

    return {
        deleteAsync,
        getAsync,
        putAsync
    };
};
