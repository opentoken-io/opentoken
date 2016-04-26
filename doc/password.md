Password
=======

The `password` option in `config.json` allows you to set which algorythm we use to hash a value. Primarily this is being used for `accountId` when stored so we aren't using the original `accountId`.

    "password": {
        "hashAlgo": "sha256"
    }