Account
=======

Configuration
-------------

The `account` options in `config.json` allow you to set how long an account is viable at times during it's lifespan. There are current only settings for `initiate` and `complete`. We want the lifetime for an initial account creation to be short so we can clean up accounts which haven't been completed and won't have numerous files sitting in storage. Also we set a `complete` account to 6 months; to comply with PCI standards.

The object assigned to each account section is passed into the OtDate object to set the expires for each lifetime.

The `idHash` property of `account` covers how the ids will be hashed when stored. This is passed into the secure hash method and then used when saving an account. **The `idHash` values must never change once set up.** If the values change a client or account holder will never be able to get back into their account.

You can find a list of available hashing methods in `lib/ciphers-and-hashes.js`.

The lengths of the IDs we use for account creation can be adjusted using `accountIdLength` and `registrationIdLength`.

The `passwordHash` section contains how the  passwords will be hashed when creating a password and logging in. This contains the same information as `idHash` as we use the same technique to hash the passwords just with different properties. The salt will be filled in when sent to the client. The settings as they currently are are saved with the account record to allow the system to check the hash when it comes in in the case of the settings being changed after a client has created their password.

The `passwordSaltLength` is used to adjust the length of the password salt we generate for the account holder to create their password hash.

Where the account information is stored can be change by updating `accountDir`. The registration files can be updated by changing `registrationDir`. Ideally these would be different as we store temporary registration files during the sign up process in the `registrationDir`, and permanent files for the account in `accountDir` once sign up is complete. These cannot be local directories as they will be passed to [storage] to handle.

    "account": {
        "accountDir": "account/",
        "accountIdLength": 24,
        "completeLifetime": {
            "months": 6
        },
        "idHash": {
            "algo": "sha256",
            "hashLength": 24,
            "iterations": 10000
        },
        "initiateLifetime": {
            "hours": 1
        },

        "passwordHash": {
            "algo": "sha512",
            "hashLength": 48,
            "iterations": 100000
        },
        "passwordSaltLength": 128,
        "registrationDir": "registration/",
        "registrationIdLength": 24
    }

The `login` section in `config.json` controls how the client is able to login to the system. There are several ways of managing how login information is created. Using `loginDir` will change where the login file is created. Changing how long the id for login is changed using `loginIdLength`. Lastly how long the login file stays on the server is managed by `loginLifetime`. This should be relatively short as these login files should not stay around too long so we can fight against time attacks.

The `challenge` section controls how long the salt should be for the challenge and which algorithm to use when hashing the salt and hashed password together.

    "login": {
        "challenge": {
            "algo": "sha512",
            "saltLength": 128
        },
        "loginDir": "/login/",
        "loginIdLength": 24,
        "loginLifetime": {
            "minutes": 15
        }
    }

Signing Up
----------

### Initiating an Account


The first action for an account is `initiate`. This sets up a few pieces of data needed to properly generate and track an account. We generate a `regId`, `mfaKey`, and `passwordSalt`. An email address must be passed in. These are then passed back to the user to store on their own and will be used to generate their password.

Information will be saved to a file named after the hash of the `regId` in the `registrationDir` [storage] location. This registration file will be deleted upon successful creation of an account file.

### Confirming an Account

The next action is to confirm an account. This requires the user to access the URL using the `regId` we gave them. We will then compare it's valid by comparing the hashes then return the `mfaKey` and `passwordSalt` so they can proceed to the next step.

### Completing an Account

To complete an account, the client will need to pass in a hashed `password`, the `regId` which we gave them previously as well as a `currentMfa` code and `previousMfa` code. This will allow us to find the registration file using the hashed `regId` and looking it up in [storage]. Getting the `mfaKey` off the account we are able to then validate the user using the MFA codes they passed in.

If the account validates, we create the account file from the registration file, add the `password` to it, and generate an `accountId`. The file is then saved under the `accountDir` using the hashed `accountId` as the file name. Only the `accountId` is sent back to the client.

Logging In
----------

Logging into OpenToken.io is a two step process, involving sending information for the client to create a secure hash from their password and OpenToken.io validating once it's sent in.

### Initiating a Login

The client will call into the application using their hashed account id with the `accountId` in the data sent. The system generates a random `loginId` and `salt` to be sent back to the client. Using the `accountId`, retrieving the file containing the client information, a `secureHash` will be dervived from the `salt` we just created and parameters. This information is sent to the client to create the same `secureHash` we saved in the login file. An expiration of the file is created and set into the file. This should be quick to deter illicit tries to login. This information will be saved using a hash of the `loginId` we created in a directory under the hashed `accountId`.

Information will then be sent to the client for them to create the secure hash for logging in. This contains the `salt` which was just created for the challenge, as well as the `algo` we are expecting them to use once they have created a password hash the same was they did for confirming signup. We also send back the data used when the password was created.

### Completing a Login

Once the password is created on the client side and passed back to OpenToken.io, the hashed password saved in the login file is compared to the hashed password which was sent to use, if they match, we then see if the `currentMfa` is valid using the [multifactor authentication](hotp.md) token sent in. If that is valid the login is complete.

Passwords
---------

Passwords are handled on the client's side and then stored in their encrypted account file upon completing the sign up process.

Passwords should be hashed along with the `passwordSalt` we provided during account signup.

    hash(password + passwordSalt)

When sending the password in for authentication, the password should be hashed again and then hashed with the challenge the applictation sent them.

    hash(hash(hashedPassword) + challenge)

The hashing of the password is handled by the client; we only store what is given. The hashing of the challenge and subsequent hashing there after, will be set in `config.json` and will utilize `pbkdf2` on both sides to maintain a consistent login paradigm.

OpenToken.io will also verify, per byte, a hash which was sent in, equals what has been hashed on its side.

    A4f38 != a4f38

[storage]: storage.md