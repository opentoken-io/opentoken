Account
=======

Configuration
-------------

The `account` options in `config.json` allow you to set how long an account is viable at times during it's lifespan. There are current only settings for `initiate` and `complete`. We want the lifetime for an initial account creation to be short so we can clean up accounts which haven't been completed and won't have numerous files sitting in storage. Also we set a `complete` account to 6 months; to comply with PCI standards.

The object assigned to each account section is passed into the OtDate object to set the expires for each lifetime.

    "account": {
        "completeLifetime": {
            "months": 6
        },
        "initiateLifetime": {
            "hours": 1
        }
    }


Initiating an Account
---------------------

The first action for an account is `initiate`. This sets up a few pieces of data needed to properly generate and track an account. We generate an `accountId`, `mfaKey`, and Password `salt`. An Email address must be passed in. These are then passed back to the user to store on their own and will be used to generate their password.

This will save the account to a file named after the hash of their `accountId`.

Completing an Account
---------------------

For an account to not expire after the initiate lifetime, a second action, `complete` must be done before the expireation of the initiated account. This will need the client to pass in their hashed `password` and `accountId` which we gave them previously as well a `currentMfa` code and `previousMfa` code. This will allow us to find their account using the `accountId` hashing it and looking it up in storage. Getting the `mfaKey` off the account we are able to then validate the user using the MFA codes they passed in.

If the account validates, we update their account with the hashed `password` and send back the information they passed in with the `password` added to it.