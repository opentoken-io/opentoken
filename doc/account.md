Account
=======

Configuration
-------------

The `account` options in `config.json` allow you to set how long an account is viable at times during it's lifespan. There are current only settings for `initiate` and `complete`. We want the lifetime for an initial account creation to be short so we can clean up accounts which haven't been completed and won't have numerous files sitting in storage. Also we set a `complete` account to 6 months; to comply with PCI standards.

The object assigned to each account section is passed into the OtDate object to set the expires for each lifetime.

The `idHash` property of `account` covers how the ids will be hashed when stored. This is passed into the secure hash method and then used when saving an account. **The `idHash` values must never change once set up.** If the values change a client or account holder will never be able to get back into their account.

Also, you can find a list of available hashing methods in `lib/ciphers-and-hashes.js`.

Where the account information is stored can be change by updating `accountDir`. Also where the registration files can be updated by changing `registrationDir`.

The lengths of the IDs we use for account creation can be adjusted using `accountIdLength` and `registrationIdLength`.

The `passwordSaltLength` is used to adjust the length of the password salt we generate for the account holder to create their password hash.

    "account": {
        "accountDir": "account/",
        "accountIdLength": 24,
        "completeLifetime": {
            "months": 6
        },
        "idHash": {
            "algo": "sha256",
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


Initiating an Account
---------------------

The first action for an account is `initiate`. This sets up a few pieces of data needed to properly generate and track an account. We generate a `regId`, `mfaKey`, and `passwordSalt`. An Email address must be passed in. These are then passed back to the user to store on their own and will be used to generate their password.

This will save the information to a file named after the hash of the `regId` in the `registrationDir` location. This registration file will be deleted upons successfully creating and account.

Confirming an Account
---------------------

The next action is to confirm an account. This requires the user to hit the URL using the `unhased regId`. We will compare it's valid by comparing the hashes then return the `mfaKey` and `passwordSalt` so they can proceed to the next step.

Completing an Account
---------------------

To complte an account, the client will need to pass in a hashed `password`, the `regId` which we gave them previously as well a `currentMfa` code and `previousMfa` code. This will allow us to find the registration file using the `regId` hashing it and looking it up in storage. Getting the `mfaKey` off the account we are able to then validate the user using the MFA codes they passed in.

If the account validates, we create the account file from the registration file, remove the `regId` as it's no longer needed, added the `password` to it, and generate an `accountId`. The file is then saved under the `accountDir` using the hashed `accountId` as the file name. Only the `accountId` is sent back to the client.