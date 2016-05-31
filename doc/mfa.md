Multi-Factor Authentication (MFA)
=================================

OpenToken.io requires the use of MFA to ensure that the right person is logging in as opposed to someone guessing a password, a keylogger stealing a password, or other unintended accesses of the secrets stored in the service.

The configuration in `config.json` uses the following properties.

    "mfa": {
        "totp": {
            "keyLength": 128,
            "name": "OpenToken.io"
        }
    }


Time-based One-Time Passwords (TOTP)
------------------------------------

This is an extension to HOTP (HMAC-based One Time Passwords), where generated secrets are valid for a short time window.

`keyLength` is the number of characters are in the base-36 encoded key.  It's equivalent to the length of the string that's generated.  20 is a reasonable number, but we prefer a higher number.

The service's `name` field is encoded into QR codes that would be generated to show the user for setting up a virtual MFA device.
