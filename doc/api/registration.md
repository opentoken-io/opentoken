Registration
============

Creating a new account with OpenToken.io is a non-trivial task.  The amount of data requested is minimal; the biggest hurdle is experienced because of the extra security required, such as setting up a MFA device.

Let's get started!  You must first find the registration [link] from the [self discovery] endpoint.  From there, you should notice that the link has a profile URI.  That's our first step.


Requesting the Profile
----------------------

This is using the `profile` attribute of the [link][Links] titled "registration-register".  Make sure to obtain the current link header from the [self discovery] endpoint instead of hardcoding links.  More information about links is [documented separately][link].

Here, the profile is being requested.  This example and all other HTTP traffic is [formatted](example-formatting.md).

    GET /schema/registration/register-request.json HTTP/1.1
    Host: api.opentoken.io

This is a sample response.  Make sure you obtain the real response because the necessary properties may change at any moment without advance notice.

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Link: </>; rel="up"; title="self-discovery"
    Link: </schema/registration/register-request.json>; rel="self"

    {
        "type": "object",
        "properties": {
            "email": {
                "$ref": "../meta/email.json"
            }
        },
        "required": [
            "email"
        ]
    }

This profile is written in [JSON Schema] and explains that the API endpoint is requesting that you use a `POST` request to send a JSON payload that validates against this schema.  This schema is expecting an object with an `email` property that validates against another schema.  To fully comprehend this schema we must also get the referenced URI.

    GET /schema/meta/email.json HTTP/1.1
    Host: api.opentoken.io

This is the result.  Well, most of the result.  The pattern is omitted, but you're welcome to use the real API to view the current version of the schema.

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Link: </>; rel="up"; title="self-discovery"
    Link: </schema/meta/email.json>; rel="self"

    {
        "type": "string",
        "format": "email",
        "pattern": *** omitted for clarity ***
        "minLength": 6
    }

In summary, the email address must look like a valid email address.


Starting A Registration
-----------------------

We are able to generate the necessary information and verify it is in the right format by checking it against the [JSON Schema] files that we retrieved earlier.  It is time to start the registration process.

    POST /registration HTTP/1.1
    Host: api.opentoken.io
    Content-Type: application/json

    {
        "email": "test-user@example.com"
    }

This will come back with information about how you can secure the account and point you in the right direction to continue the registration.  To keep this example readable, very long fields have been shortened.

    HTTP/1.1 200 OK
    Content-Type: application/json
    Link: </>; rel="up"; title="self-discovery"
    Link: </registration/TN3ztPb1Lk2VaOMG_1p9wPw9Oeev7sR9>; rel="self"
    Link: </registration/TN3ztPb1Lk2VaOMG_1p9wPw9Oeev7sR9>; rel="edit";
        profile="/schema/registration/secure-request.json";
        title="registration-secure"
    Link: </registration/TN3ztPb1Lk2VaOMG_1p9wPw9Oeev7sR9/qr>; rel="item";
        title="registration-secure-qr"
    Location: /registration/TN3ztPb1Lk2VaOMG_1p9wPw9Oeev7sR9

    {
        "passwordHashConfig": {
            "algorithm": "sha512",
            "derivedLength": 48,
            "encoding": "base64",
            "iterations": 100000,
            "salt": "S9KlR3C8cI.....maOsgG4AaW",
            "type": "pbkdf2"
        },
        "mfa": {
            "totp": {
                "keyBase32": "A3WBRKFPNN.....2HHV2U54S4",
                "keyHex": "06ec18a8af.....9ebaa7792e",
                "keyUri": "otpauth://totp/test-user.....2HHV2U54S4"
            }
        }
    }

This tells us several things.  First, investigate the body of the response.  This is explaining how passwords are expected to be hashed before being sent.  In this case, we want the user's password to be passed through PBKDF2 using SHA512 that's been salted with the given salt and churned for 100,000 iterations.  After that's complete, pull out 48 bytes and encode the result with Base64.

The next bit in the body is providing the keys for setting up a virtual MFA device using [TOTP](https://tools.ietf.org/html/rfc6238).  The encoded key is provided in Base32, hexadecimal and as a URI.  Depending on how it will be used, these are the most likely ways that tools will request the keys.  Well, a lot of phones run MFA software and can be set up with a QR code, so it would be beneficial if that were supported.

Looking at the headers, we see that there's a `registration-secure-qr` link header.  Issuing a `GET` on that URI would provide an image.  This image contains the MFA key as a QR code, ready for scanning by your phone.

The last bit that should be investigated is the `registration-secure` link.  It points to this resource and asks for a profile.  You'll notice that it is an `edit` link relation.  This means you can `GET` on the URI as well as `POST` to the URI.  In this case, the URI is the same resource we are currently viewing.

In order to determine what is next, we must fetch the profile URI for the `registration-secure` link.


Profile for Securing the Registration
-------------------------------------

As before, this is another schema.

    GET /schema/registration/secure-request.json HTTP/1.1
    Host: api.opentoken.io

This time the result is quite a bit bigger.

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Link: </>; rel="up"; title="self-discovery"
    Link: </schema/registration/secure-request.json>; rel="self"

    {
        "type": "object",
        "properties": {
            "mfa": {
                "type": "object",
                "properties": {
                    "totp": {
                        "type": "object",
                        "format": "totp-current-and-previous",
                        "properties": {
                            "current": {
                                "$ref": "../meta/totp-code.json"
                            },
                            "previous": {
                                "$ref": "../meta/totp-code.json"
                            }
                        },
                        "required": [
                            "current",
                            "previous"
                        ]
                    }
                },
                "required": [
                    "totp"
                ]
            },
            "passwordHash": {
                "$ref": "../meta/password-hash.json"
            }
        },
        "required": [
            "mfa",
            "passwordHash"
        ]
    }

The summary of all that simply states it wants an object with your hashed password and two codes from the MFA device to make sure that was set up correctly.  You'll build a JSON object similar to the following example.

    {
        "mfa": {
            "current": "456789",
            "previous": "012345"
        },
        "passwordHash": "ik9-lxUFpzUIXiLmX5KdrcZgXUXw9BVxAM5_KeL_nyYeSr3tb-kIFW5MBSyJR2oZ"
    }


Hashing your Password
---------------------

The hashed password needs to follow the configuration that is provided by the API in order to maintain interoperability with other tools.  The configuration was given earlier when the registration was started.  Here it is again, for reference; just the `passwordHashConfig` property is shown.

    "passwordHashConfig": {
        "algorithm": "sha512",
        "derivedLength": 48,
        "encoding": "base64",
        "iterations": 100000,
        "salt": "S9KlR3C8cI.....maOsgG4AaW",
        "type": "pbkdf2"
    }

First, look at the `type`.  It is "pbkdf2", and that's explained by [RFC 2898](https://tools.ietf.org/html/rfc2898).  It defines a way to use a cryptographic hash function (SHA512 according to this configuration) repeatedly in order to slow down attackers.  The hash function is seeded with some data (the `salt`) and the data to hash (the user's password).  The hash is repeated a number of times (100,000 in our example) and some amount of information is extracted at the end.  We're pulling 48 bytes and then, to make it safer to transport, encoding it with Base64.

If you prefer some pseudocode, this is how it would work.

    // Set up PBKDF2 with SHA512 and 100000 iterations
    pbkdf2 = new Pbkdf2("sha512", 100000);
    pbkdf2.setSalt("S9KlR3C8cI.....maOsgG4AaW");

    // Generate the binary hashed data and encode it
    pbkdf2.update(userPassword);
    hashedPassword = pbkdf2.digest(48);
    encodedPassword = hashedPassword.encode("base64");

There are [example scripts](https://github.com/opentoken-io/opentoken/tree/master/example) that can assist with further explanations.

The hashed password is sent because the API never needs your original password.  In case of extreme database breach and someone gets their hands on all password hashes, the damage is constrained to just OpenToken.io and doesn't put your other accounts at risk.


Setting Up MFA
--------------

As mentioned earlier, there is a link to a QR code image and the MFA seed is embedded in the registration resource three times in different formats.  They are all the same key, so just pick the one that is the easiest for you to use.

Once you set up a MFA device, the user will have to keep track of a code.  In our example, we use "012345" as the first code that was generated.  After a span of time, the code will change.  "456789" is the second code in our example.  These two codes must immediately be sent to the server otherwise the server will say the codes do not match and you'll have to redo this one step.


Securing the Registration
-------------------------

When you are armed with your hashed password and two consecutive MFA codes, you are ready to secure your registration information.

    POST /registration/TN3ztPb1Lk2VaOMG_1p9wPw9Oeev7sR9 HTTP/1.1
    Host: api.opentoken.io
    Content-Type: application/json

    {
        "mfa": {
            "current": "456789",
            "previous": "012345"
        },
        "passwordHash": "ik9-lxUFpzUIXiLmX5KdrcZgXUXw9BVxAM5_KeL_nyYeSr3tb-kIFW5MBSyJR2oZ"
    }

This response is a bit more cryptic.

    204 No Content
    Link: </>; rel="up"; title="self-discovery"
    Link: </registration/TN3ztPb1Lk2VaOMG_1p9wPw9Oeev7sR9>; rel="self"

Not to worry; the 204 status indicates that what you have done was successful.  At this point, the API is sending you an email confirmation.  Inside that email will be the random confirmation link.


Email Confirmation
------------------

The email will contain a link that you simply need to retrieve and your account will be created.

    GET /registration/TN3ztPb1Lk2VaOMG_1p9wPw9Oeev7sR9/confirm/ruQcD2XELMvY0lqVSfkQsXiEbFTHu715
    Host: api.opentoken.io

This final response indicates where you should go to login to your new account.

    201 Created
    Content-Type: application/json
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH>; rel="self"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/login>; rel="login";
        profile="/schema/account/login-request.json";
        title="account-login"

    {
        "accountId": "W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH"
    }

Those links are *very* important!  Keep the account ID alongside your password in your password manager.  You may now proceed to [using your account](account.md).

[JSON Schema]: http://json-schema.org/
[Link]: links.md
[Self Discovery]: self-discovery.md
