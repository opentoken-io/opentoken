Encryption
==========

The `encryption` options in the `config.json` allow you to select the cipher, hash, key digests and iterations for your security needs.  There's a "primary" and a "secondary" configuration, where "primary" is always used and "secondary" may be used in addition to the primary.

    "encryption": {
        "primary": {
            "cipher": {
                "algo": "aes-256-cbc",
                "digest": "sha512",
                "iterations": 10000
            },
            "hmac": {
                "algo": "sha512",
                "digest": "sha512",
                "iterations": 10000
            }
        },
        "secondary": {
            "cipher": {
                "algo": "bf-cbc",
                "digest": "whirlpool",
                "iterations": 10000
            },
            "hmac": {
                "algo": "whirlpool",
                "digest": "whirlpool",
                "iterations": 10000
            }
        }
    }

The above are the recommended settings for today.  As machines get more powerful, you can increase the number of iterations.  When new algorithms are designed and proved to be more secure, you can select different digests and algorithms.

Properties
----------

The structure for the primary and secondary encryption layers are identical, so they will not be discussed individually.

All of the algorithms and hashes must be defined in the `ciphers-and-hashes.js` file.  Look there if you want to know what values are supported.

* `cipher.algo` - [cipher] Encryption algorithm.
* `cipher.digest` - [hash] The hashing digest used for secure key generation.
* `cipher.iterations` - [number] How many times to securely hash the key before using it for encryption/decryption.
* `hmac.algo` - [hash] Secure hash algorithm, similar to a CRC of the data.
* `hmac.digest` - [hash] The hashing digest used for secure key generation.
* `hmac.iterations` - [number] How many times to securely hash the key before using it for generation of the HMAC.
