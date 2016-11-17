Using An Account
================

During the [registration process][Registration], an account was created.  In our examples, we are using the account ID `W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH`.  You should also know about [link headers](links.md).


Preparing to Log In
-------------------

You can follow the link from [registration] where you are provided a normal link.  Alternately, one can begin with [self-discovery](self-discovery.md) and fill in a templated link.  The link's title is `account-login` and it also has a profile.  The first thing we must do is fetch the profile.  Here's the [example] that fetches the profile:

    GET /schema/account/login-request.json HTTP/1.1
    Host: api.opentoken.io

And the response is pretty straightforward.

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Link: </>; rel="up"; title="self-discovery"
    Link: </schema/account/login-request.json>; rel="self"

    {
        "type": "object",
        "properties": {
            "challengeHash": {
                "$ref": "../meta/challenge-hash.json"
            },
            "mfa": {
                "type": "object",
                "properties": {
                    "totp": {
                        "$ref": "../meta/mfa-totp-code.json"
                    }
                },
                "required": [
                    "totp"
                ]
            }
        },
        "required": [
            "challengeHash",
            "mfa"
        ]
    }

Because the `account-login` link is a "service" link relation, we know we need to start with the right information as specified in the profile.  (If you don't know this, check out the [link header explanations](links.md).)  This schema is asking for a JSON object that follows a structure like this:

    {
        "challengeHash": "Some hashed password-related information here",
        "mfa": {
            "totp": "000000"
        }
    }

The MFA seed was given to us during [registration], so we can calculate the current TOTP value.  The `challengeHash` property is a bit harder.  We don't have enough information yet for logging in, so we must issue a GET on the service URI.

    GET /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/login HTTP/1.1
    Host: api.opentoken.io

This response helps us out tremendously by providing necessary bits for calculating this password hash.  As was the case with registration, the more lengthy values are shortened to keep the example as readable as possible.

    HTTP/1.1 200 OK
    Content-Type: application/json
    Link: </>; rel="up"; title="self-discovery"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/login>; rel="self"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/login>; rel="service";
        profile="/schema/account/login-request.json";
        title="account-login"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH>; rel="up"; title="account"

    {
        "challengeHashConfig": {
            "algorithm": "sha512",
            "encoding": "hex",
            "salt": "mrBQzuLIZa.....d4DboTrs2i",
        },
        "passwordHashConfig": {
            "algorithm": "sha512",
            "derivedLength": 48,
            "encoding": "base64",
            "iterations": 100000,
            "salt": "S9KlR3C8cI.....maOsgG4AaW",
            "type": "pbkdf2"
        }
    }

The idea is that the user will enter their password.  A routine will use the configuration from the `passwordHashConfig` property to configure PBKDF2 to use a salted SHA512 for 100000 iterations and then derive 48 bytes and encode it as Base64.  That result is fed into a secondary hash function, specified by the `challengeHashConfig` settings.  In this case the result would have the secondary salt applied, hashed with SHA512 and the result will be encoded in hexadecimal.

Here is the same information written out in pseudocode.

    // Set up PBKDF2 with SHA512 and 100000 iterations
    pbkdf2 = new Pbkdf2("sha512", 100000);
    pbkdf2.setSalt("S9KlR3C8cI.....maOsgG4AaW");

    // Generate the binary hashed data and encode it
    pbkdf2.update(userPassword);
    hashedPassword = pbkdf2.digest(48);
    encodedPassword = hashedPassword.encode("base64");

    // Hash again against the challenge
    hash = new Hash("sha512");
    hash.update(encodedPassword);
    hash.update("mrBQzuLIZa.....d4DboTrs2i");

    // Get the value to send to the API
    challengeHashBinary = hash.digest();
    challengeHash = challengeHashBinary.encode("hex");

If you prefer a more mathematical representation, you could envision it like this:

    SHA512(PBKDF2(userPassword, passwordHashConfig.salt) + challengeHashConfig.salt)

The `passwordHashConfig` will be identical to what was provided during [registration] and the result of hashing the password will be the exact same.  This is fed into a secondary hash that uses a challenge (the `challengeHash.salt` value).  The challenge is used to prevent replay attacks.  Challenges expire after a small period (a few minutes).


Logging In
----------

Now that we have the necessary information, this is what a login request will look like.

    POST /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/login HTTP/1.1
    Host: api.opentoken.io
    Content-Type: application/json

    {
        "challengeHash": "98b71436b3.....fbae2d59c8",
        "mfa": {
            "totp": "323881"
        }
    }

Assuming everything goes according to plan, the result will look a lot like this.

    HTTP/1.1 200 OK
    Content-Type: application/json
    Link: </>; rel="up"; title="self-discovery"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH>; rel="up"; title="account"
    Set-Cookie: login=L2szF0mI3b.....NjbduJj74B; .....

    {
        "sessionId": "L2szF0mI3b.....NjbduJj74B"
    }

The cookie is created with the intent to make it easier for a web-based interface that deals directly with the API and can perform administrative actions.

Now that you are logged in, you can create [access code pairs](access-codes.md).  Being logged in does not allow you access to tokenize nor detokenize data.


Account Actions
---------------

When you were done logging into your account, there was an `up` link relation that was titled `account`.  Fetch that resource to see what you can do.  Make sure your cookie is sent with the request.  Here's a [formatted example](example-formatting.md) of the GET request, with extra long bits shortened to aid readability.

    GET /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH
    Host: api.opentoken.io
    Cookie: login=L2szF0mI3b.....NjbduJj74B

The response provides links to services that are exposed and returns some account information.

    HTTP/1.1 200 OK
    Content-Type: application/json
    Link: </>; rel="up"; title="self-discovery"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH>; rel="self"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/accessCode>; rel="service";
        profile="/schema/account/access-code-request.json",
        title="account-accessCode"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/logout>; rel="service";
        profile="/schema/account/logout-request.json",
        title="account-logout"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/token{?public}>; rel="service";
        profile="/schema/account/token-create-request.json",
        templated="true"; title="account-token-create"
    Set-Cookie: login=L2szF0mI3b.....NjbduJj74B; .....

    {
        "email": "test-user@example.com"
    }

The links explain what actions are allowed.

* [Log out](logout.md) of the current session
* [Tokenization](tokens.md)
* Managing [access codes](access-codes.md)

[Account]: account.md
[Registration]: registration.md
