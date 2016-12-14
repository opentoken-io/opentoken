OpenToken Configuration
=======================

The server is controlled by a `config.json` and optionally an [Override JSON](config-override.md).

Each of the properties is listed by how one would reference it in JavaScript. Many of the values are structures that repeat and those link to the [Common Data Structures] document.

For examples, see the [config.json](../config.json) as distributed with OpenToken.

All generated IDs will use letters (both lowercase and uppercase), numbers, hyphens and underscores. A sample ID could be `WpsUpTs8k5nzX6_8vrQ2-zfjJVNpaa6g` (32 bytes long).


Access Codes
------------

Access codes are generated when someone is logged into their account. The codes are used to sign requests to tokenize and detokenize data.


### `accessCode.codeHash`

How the public portion of the access code is converted into a hash when sent to the [storage engine]. See `hash` in [Common Data Structures]. It is strongly suggested you use a URI-compatible encoding method.


### `accessCode.codeLength`

When generating random access codes, the public portion's code is a string with the specified number of bytes.


### `accessCode.lifetime`

How long the access code should live until it is expired. See `lifetime` in [Common Data Structures]. PCI-compliant services will have this set to no more than 6 months.


### `accessCode.secretLength`

When generating random access codes, the private portion will be this many bytes long.


### `accessCode.storagePrefix`

A string used by the [storage engine] as a prefix when saving. The storage engine will receive `storagePrefix` + `hash(accessCode)`.


Accounts
--------

API keys and tokenized data are all saved within accounts. Account generation is one of the first things you do in order to use the service.


### `account.idHash`

How the public account ID is turned into a hashed version. The hashed version is used with the [storage engine]. See `hash` in [Common Data Structures]. It is strongly suggested you use a URI-compatible encoding method.


### `account.idLength`

The number of random bytes in a generated account ID.


### `account.lifetime`

How long the account will exist. When the lifetime is reached, the account will be automatically deleted. See `lifetime` in [Common Data Structures]. A PCI-compliant service will have this set to no more than 6 months.


### `account.loginCookie`

This object defines how the cookie is used during login in order to create API keys.

    "loginCookie": {
        "name": "login",
        "settings": {
            "httpOnly": true,
            "maxAge": 600,
            "path": "/account/",
            "secure": true
        }
    }

The `name` is the cookie as it would appear in a browser. `settings` defines an object that controls the cookie creation and additional essential information sent to the browser. In this example, `httpOnly` means JavaScript may not access it, `maxAge` expires the cookie after 10 minutes, `path` restricts the cookie to only paths on the API containing "/account/" and `secure` means this cookie is only sent by the browser when viewing website using HTTPS.


### `account.passwordHash`

This configuration is sent to the client when registering for the service. The user will hash their password according to this spec and send it back to us. See `hash` in [Common Data Structures].


### `account.passwordSaltLength`

A random salt used to seed the secure hash generation function. The generation function makes an ID of the necessary length and calls it the password's salt.


### `account.storagePrefix`

String that is prefixed to the hashed ID when being sent to the [storage engine]. Data will be saved to `storagePrefix` + `hash(accountId)`.


Challenges
----------

A challenge code is provided whenever someone wishes to login to an account. It protects the login from cross-site request forgeries (CSRF). During login, the client will first hash the password according to `account.passwordHash`. When that password hash is generated, the challenge ID will be appended and then the entire string will be hashed again.


### `challenge.challengeHash`

This is the hash method to use and how to encode it. The input will be a string of `passwordHash` + `challengeId`. This is passed through the hash algorithm `algorithm` and encoded with `encoding`.

    "challengeHash": {
        "algorithm": "sha512",
        "encoding": "hex"
    }


### `challenge.idHash`

The challenge ID will be hashed using this configuration before being passed to the [storage engine]. See `hash` in [Common Data Structures].


### `challenge.idLength`

The number of bytes to generate for an ID.


### `challenge.lifetime`

How long a challenge can persist. If a login is attempted and the challenge has expired, the login will be denied. See `login` in [Common Data Structures].


### `challenge.storagePrefix`

Where the challenges are stored in the [storage engine]. The challenges are associated with the account, so the storage engine is given `storagePrefix` + `hash(accountId)` as a key.


Debugging
---------

Additional debug information may be provided to the console when this setting is enabled.


### `debug`

If `false`, additional debugging is disabled. All truthy values enable the additional logging.


Email
-----

In order to verify accounts, emails are sent out. This is a configurable backend and is [described separately](email.md).


Encryption
----------

Records are stored using a layered encryption scheme. The outer layer is the `primary` and the inner is the `secondary`.

In the configuration, the `primary` and `secondary` sections are mirrors of each other.


### `primary.cipher` and `secondary.cipher`

This defines the cipher algorithm and the number of iterations that should be performed when doing the encryption. See `cipher` in [Common Data Structures].


### `primary.hmac` and `secondary.hmac`

The record contains a secure signature to prevent tampering. The HMAC settings control what type of signature is made. See `hmac` in [Common Data Structures].


Multi-Factor Authentication (MFA)
---------------------------------

We guard accounts with both a password and a device configured to generate numbers. This is the basis of our multi-factor authentication for login.

TOTP is the only algorithm supported. TOTP stands for a time-based HOTP. HOTP is a HMAC based one-time password (OTP). HMAC is a keyed-hash message authentication code. Initialisms are fun.


### `mfa.totp`

This object configures how the TOTP algorithm is configured. The `keyLength` is used for seeding the TOTP number generation algorithm and `name` is used during QR code generation. The QR codes are created to save the user from having to type in lengthy keys.


Record
------

The data stored in the system is all passed through the `record` module. This dictates a few global settings.


### `record.encryptionKeyFile`

Filename containing the server's encryption key. This should be randomly generated data. The length of this key should be adequately large to seed any initialization vector used by any cipher algorithm. OpenToken is using an encryption key of 1024 bytes.


### `record.lifetimeMaximum`

No lifetime anywhere else in the configuration file can be any larger than this number. For PCI compliance, this should be set to a maximum of 6 months. See `lifetime` in [Common Data Structures].


Schemas
-------

### `schemaPath`

This folder lists where all JSON schemas are located. They are loaded into memory when the service starts.


Sessions
--------

When logging into the system using a password and MFA, this will create a time-limited session, which is relayed as a cookie.


### `session.idHash`

How the session ID is hashed before it is used with the [storage engine]. See `hash` in [Common Data Structures].


### `session.idLength`

How long the session IDs should be when they are generated.


### `session.lifetime`

The amount of time that a session will last. Sessions are renewed with every API action, so this only will matter if the lifetime elapses between calls. See `lifetime` in [Common Data Structures].


### `session.storagePrefix`

The prefix that is added to the key when passed to the [storage engine]. The data is saved under the account, so the resulting key is `storagePrefix` + `hash(accountId)` + `/` + `hash(sessionId)`.


Server
------

These govern the server itself, such as what hostname it advertises.


### `server.baseUrl`

When giving fully qualified links, the `baseUrl` is prepended to links. Make sure this does not end in a `/`, otherwise you'll generate links that may not work.


### `server.bodyBytesMaximum`

When reading requests, only this many bytes will be read in the body.  This limits the maximum amount of data that can be tokenized.


### `server.port`

The port to listen on. It is best if the process does not run with any extra privileges, and that means you should use a port that is higher than 1024.


### `server.profileMiddleware`

If truthy, the middleware will be profiled and log messages will be periodically written that evaluate how much time each piece of middleware is consuming. This is a type of debugging output that is not covered by the `debug` setting.


### `server.proxyProtocol`

Enables [Proxy Protocol](http://www.haproxy.org/download/1.5/doc/proxy-protocol.txt) support in the listening server. Proxy protocol is supported in a strict sense; when this setting is enabled, requests without proxy protocol are rejected and will cause errors.


### `server.requestIdLength`

Every incoming request is assigned a random identifier for associating multiple log entries together.  The generated ID's length is controlled by this setting.



Signatures
----------

The requests to the server for tokenization and detokenization are signed, and this section controls many aspects of the signature generation and validation. There is [more detailed documentation][request signatures] available.


### `signature.dateWindowFuture` and `signature.dateWindowPast`

Signed requests have an `X-OpenToken-Date` header field that is included in the signature. The request's date is validated against the server's time to help prevent a replay attack. These settings limit the allowed dates by specifying a maximum deviation into the future or into the past.

The time window is from (now - `signature.dateWindowPast`) through (now + `signature.dateWindowFuture`). See `lifetime` in [Common Data Structures] to learn how to specify the time offset.


### `signature.host`

The `Host` header in the request must match this setting. All other values will be rejected.


### `signature.method`

This is sent to the client indicating what type of signature method should be employed. It is a four-part signature: version, signature type, hashing method, encoding format. Currently the only allowed value is `OT1-HMAC-SHA256-HEX`.

`OT1`: Version number of the signature method. OT1 dictates what fields and how to arrange data to be signed. The signature generation is [covered separately][request signatures].

`HMAC`: The hashing mechanism to use, which defines how the engine is seeded with data.

`SHA256`: The hash algorithm.

`HEX`: The encoding method. Hex is often assumed, but it is good to be explicit.


### `signature.relatedLink`

The URL that is provided to the client to explain how signatures are generated and validated.


Storage Engine
--------------

Determines which engine to use and configures the engine. This is [covered separately][storage engine].


Templating
----------

OpenToken does not have a lot of user interaction, which lowers its needs dramatically. However, there are emails sent out and those emails are templated.


### `template.emailPath`

Where email templates are stored.


Token
-----

Token generation configuration.


### `token.idHash`

How the token ID is hashed before being sent to the [storage engine]. See `hash` in [Common Data Structures].


### `token.idLength`

How many bytes will be in the generated tokens.


### `token.lifetime`

How long tokenized data will be retrievable from the service. See `lifetime` in [Common Data Structures].


### `token.storagePrefix`

The prefix that's given to the [storage engine] for saving and loading. The storage engine will receive `storagePrefix` + `hash(tokenId)`.


[Common Data Structures]: ./config-common.md
[Override JSON]: ./config-override.md
[Request Signatures]: ./request-signatures.md
[Storage Engine]: ./storage.md
