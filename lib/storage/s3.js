"use strict";

class S3 {
    /**
     * @param {Object} awsSdk
     * @param {Object} promise
     */
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
     * @private
     * @return {Object} s3Bucket
     */
    transit() {
        if (! this.s3Bucket) {
            this.s3Bucket = new this.aws.S3({params: {Bucket: this.config.bucket}});

            this.s3Bucket = this.promise.promisifyAll(this.s3Bucket);
        }

        return this.s3Bucket;
    }


    /**
     * Configures options for AWS.
     *
     * @param {Object} config
     * @return {Object} this
     */
    configure(config) {
        this.aws.config.region = config.region || "us-east-1";
        this.config.bucket = config.bucket || null;
        config = null;

        return this;
    }
    
    /**
     * Deletes a single file from selected bucket
     *
     * @param {string} filename
     * @return {Object} promise
     */
    fileDel(filename) {
        return this.transit().deleteObjectAsync({Key: filename});
    }


    /**
     * Gets a file from S3.
     *
     * @param {string} filename
     * @return {Object} promise
     */
    fileGet(filename) {
        var params;
        
        params = {
            Key: filename
        };
        
        return this.transit().getObjectAsync(params);
    }


    /**
     * Gets a list of files and "directories" from S3.
     *
     * @param {string} prefix
     * @return {Object} promise
     */
    fileList(prefix) {
        var params;

        params = {
            Prefix: prefix || null
        };

        return this.transit().listObjectsAsync(params);
    }


    /**
     * Uploads a file to the chosen bucket on S3.
     *
     * @param {string} filename
     * @param {(Buffer|string)} contents
     * @param {Object} options
     * @return {Object} promise
     */
    filePut(filename, contents, options) {
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
}

module.exports = S3;