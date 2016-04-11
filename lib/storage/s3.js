"use strict";

class S3 {
    constructor(awsSdk, promise) {
        this.aws = awsSdk;
        this.config = {};
        this.configure({});
        this.promise = promise;
        this.s3Bucket = null;
    }


    /**
     * Creates the S3 bucket we need for subsequent calls.
     *
     * @return {Object} s3Bucket
     */
    transit() {
        if (! this.s3Bucket) {
            this.s3Bucket = new this.aws.S3({params: {Bucket: this.config.bucket}});

            this.promise.promisifyAll(this.s3Bucket);
        }

        return this.s3Bucket;
    }


    /**
     * Configures options for AWS.
     */
    configure(config) {
        this.aws.config.region = config.region || "us-east-1";
        this.config.bucket = config.bucket || null;
        config = null;

        return this;
    }


    /**
     * Get a file from S3.
     *
     * @param {string} key
     */
    fileGet(key) {
        return this.transit().getObjectAsync({Key: key})
    }


    /**
     * Gets a list of files and "directories" from S3.
     */
    fileList() {
        return this.transit().listBucketsAsync();
    }


    /**
     * Uploads a file to the chosen bucket on S3.
     *
     * @param {string} filename
     * @param {(string | buffer}) contents
     * @param {Object} options
     */
    filePut(filename, contents, options) {
        var params;

        params = {
            Body: contents,
            ContentType: "text/plain",
            Key: filename
        };

        if (options) {
            params.ContentType = options.contentType || "text/plain";
            params.Expires = options.expires || null;
        }

        return this.transit().putObjectAsync(params);
    }
}

module.exports = S3;