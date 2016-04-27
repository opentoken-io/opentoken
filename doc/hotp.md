HOTP
====

Configuration
-------------

The `hotp` options allow us to maintain how long we are generating a secret key and what the name of the application is. This is separate from the server name as that could possible change to something more descriptive of the server and we want to the name to match the overall application as opposed to a server name.

    "hotp": {
        "name": "OpenToken.io",
        "keySize": 128
    }