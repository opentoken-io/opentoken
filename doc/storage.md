Storage
=======

Configuration
-------------

The `storage` options in `config.json` help to handle many facets of how storage is accomplished in OpenToken.io. Setting `engine` to your desired code in the storage directory will let set up the application to be able to inject your desired engine into code where it will be needed.  It is advisable to set up specific engine configuration options in it's own property.

    "storage": {
        "engine": "s3",
        "s3": {
            "bucket": "opentoken-io-storage",
            "region": "us-east-1"
        }
    }

### S3

To configure the engine to use Amazon's S3 as OpenToken.io is by default inside the `s3` key, `bucket` will set where the engine will be getting, putting, listing, and deleting the data from, while `region` lets you decide the region the data should be stored in.

*These are if you are using Amazon's S3, these keys can change to suit other storage needs.*
