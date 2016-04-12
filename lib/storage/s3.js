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
     * Deletes a single file from configured bucket.
     *
     * @param {string} filename
     * @return {Object} promise
     */
    fileDel(filename) {
        var params;
        
        params = {
            Key: filename
        };
        
        return this.transit().deleteObjectAsync(params);
    }


    /**
     * Gets a file from S3 from the configured bucket.
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