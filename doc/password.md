Password
=======

The `password` option in `config.json` allows you to set which algorithm we use to hash a value. Primarily this is being used for `accountId` when stored so we aren't using the original `accountId`.

    "password": {
        "hashAlgo": "sha256"
    }

You can also find a list of available hashing methods in `lib/ciphers-and-hashes.js`.