Storage Engine
==============

The `storage` options in `config.json` help to handle many facets of how storage is accomplished in OpenToken.io. Setting `engine` to your desired code in the storage directory will let set up the application to be able to inject your desired engine into code where it will be needed.  Each storage engine would store its configuration settings under its own property.

    "storage": {
        "engine": "s3",
        "s3": {
            "accessKeyId": "your access key, optional",
            "bucket": "opentoken-io-storage",
            "region": "us-east-1",
            "secretAccessKey": "your secret access key, optional"
        }
    }

### `storage.engine`

Determines the storage backend to use.  Currently, only `s3` is supported.


S3 Backend
----------

The S3 service from Amazon's hosting platform works as a storage solution.

You may use the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables instead of specifying the keys directly in the config file.  Alternately, you can use machine roles or specify the settings in the config.


### `storage.s3.accessKeyId` and `storage.s3.secretAccessKey`

AWS credentials for communicating with S3.  Alternately, environment variables can be used or machine roles.


### `storage.s3.bucket`

The bucket name for storing data.


### `storage.s3.region.

The S3 region to use.
