OpenToken Configuration - Common Data Structures
================================================

There are several sections in the [configuration file][config] used in a similar way and are simply applied to different aspects of the server.  These are all explained in detail here instead of repeating the description.


`cipher`
--------

Data is encrypted using an initialization vector based on a seed that was hashed a given number of `iterations` using `digest`.  This is fed into the `algorithm` along with the data to produce the ciphertext.

    "cipher": {
        "algorithm": "aes-256-cbc",
        "digest": "sha512",
        "iterations": 1000"
    }


`hash`
------

In order to generate a cryptographic hash of any input data, there are many settings that can be changed.  The `hash` structure lets you specify them once and allows for enough flexibility to support future hashing mechanisms.

    "hash": {
        "algorithm": "sha512",
        "derivedLength": 32,
        "encoding": "base64-uri",
        "iterations": 5000,
        "type": "pbkdf2"
    }

The `type` is used first.  Currently, only `pbkdf2` is supported.

All hashes create binary signatures.  Typically the hash is then encoded into hexadecimal and displayed on a screen.  The `encoding` property is how the binary data is represented.  Depending on the use, you may require a "-uri" version of the encoding.


### `pbkdf2` hashing

PBKDF2 defines a way for a hashing algorithm to consume more time by running the hash repeatedly.  It is supposed to slow down hackers and is configurable so you can tweak the algorithm to use more time as computers get faster.

This type of hashing lets you adjust the hashing `algorithm` that is used and the `iterations` for how many times to encode.  When done, it generates `derivedLength` bytes of binary data and that is later encoded using the specified `encoding`.


`hmac`
------

This is a cryptographic hash signature.  The `algorithm` and `digest` must both be listed in [lib/ciphers-and-hashes.js].  The hash algorithm is seeded with data that is hashed with the `digest` a number of `iterations`.  This generates an initial key and the `algorithm` is used to generate a signature.

    "hmac": {
        "algorithm": "sha512",
        "digest": "sha512",
        "iterations": 9000
    }


`lifetime`
----------

This defines a timespan or a window that something is allowed.  Typically this is used to set an expiration date on a record.  The following properties may be on the object:

* `years`
* `months`
* `days`
* `hours`
* `minutes`
* `seconds`
* `milliseconds`

The registration process typically requires someone gets the email fairly quickly, so it may want to set a 1 hour timeout.

    "lifetime": {
        "hours": 1
    }


[config]: ./config.md
[lib/ciphers-and-hashes.js]: ../lib/ciphers-and-hashes.js
