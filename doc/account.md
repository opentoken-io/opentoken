Account
=======

Configuration
-------------

The `account` options in `config.json` allow you to set how long an account is viable at times during its lifespan. There are currently only settings for `initiate` and `complete`. We want the lifetime for an initial account creation to be short so we can clean up accounts which haven't been completed and we won't have numerous files sitting in [storage]. Also, we set a `complete` account to expire in 6 months; to comply with PCI standards.

The object assigned to each account section is passed into the OtDate object to set the expires for each lifetime.

The `idHash` property of `account` covers how the ids will be hashed when stored. This is passed into the secure hash method and then used when saving an account. **The `idHash` values must never change once set up.** If the values change a client or account holder will never be able to get back into their account.

You can find a list of available hashing methods in `lib/ciphers-and-hashes.js`.

The location of where the account information is stored can be change by updating `accountDir`. The registration files can be updated by changing `registrationDir`. Ideally these would be different as we store temporary registration files during the sign up process in the `registrationDir`, and permanent files for the account in `accountDir` once sign up is complete. These cannot be local directories as they will be passed to [storage] to handle.

The lengths of the IDs we use for account creation can be adjusted using `accountIdLength` and `registrationIdLength`.

The `passwordSaltLength` is used to adjust the length of the password salt we generate for the account holder to create their password hash.

    "account": {
        "accountDir": "account/",
        "accountIdLength": 24,
        "completeLifetime": {
            "months": 6
        },
        "idHash": {
            "algorithm": "sha256",
            "hashLength": 24,
            "iterations": 10000,
            "salt": "Ucg4TTL1N7tt6GMw3W3wULgaf4lALKHOuM4SBnh0FocOr3ccLH9eXLneoDDOrMVZ"
        },
        "initiateLifetime": {
            "hours": 1
        },
        "passwordSaltLength": 128,
        "registrationDir": "registration/",
        "registrationIdLength": 24
    }

[storage]: storage.md
