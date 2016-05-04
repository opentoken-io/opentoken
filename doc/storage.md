Storage
=======

Configuration
-------------

The `storage` options in `config.json` help to handle many facets of how storage is accomplished in OpenToken.io. Setting `engine` to your desired code in the storage directory will let set up the application to be able to inject your desired engine into code where it will be needed.

To configure the engine, `bucket` will set where the engine will be getting, putting, listing, and deleting the data from, while `region` lets you decide the region the data should be stored in. *These are if you are using Amazon's S3, but the these keys can change if need be.*

```
    "storage": {
        "bucket": "opentoken-io-storage",
        "engine": "s3",
        "region": "us-east-1"
    }
```