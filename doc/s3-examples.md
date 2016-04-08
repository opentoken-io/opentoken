S3 Examples
=====

Below are examples of utilizing S3 from the application. Before getting these to work you will need to export your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY or set these as environment variables.

Make sure to download a copy of the [AWS-SDK-JS](https://github.com/aws/aws-sdk-js) first.

Putting a File
--------------

    "use strict";

    function putFile () {
        var aws, callback, fileName, params, s3Bucket;

        aws = require("aws-sdk");
        aws.config.region = "us-east-1";
        s3Bucket = new aws.S3({params: {Bucket: "opentoken-io-test-s3"}});

        callback = function(err, data) {
            if (err) {
                console.log("Error uploading file.");
            } else {
                console.log("Uploaded successfully!");
            }
        };

        fileName = "test-file-" + Math.floor((Math.random() * 1000000) + 1);
        params = {Key: fileName, Body: "Hello!", ContentType: "text/plain", ServerSideEncryption: "AES256"};
        s3Bucket.upload(params, callback);
    }

    putFile();
