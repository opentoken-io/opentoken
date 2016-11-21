Access Code Pairs
=================

After you have successfully logged into your [account], you are able to create access code pairs. These code pairs are allowed to [tokenize and detokenize](tokens.md) data associated with your account.


Creation of Code Pairs
----------------------

When you fetched your [account resource][account] and discovered the [link relations](links.md) to other services, there was one titled `account-accessCode`. It has an associated profile, so let's fetch that first.

    GET /schema/account/access-code-request.json HTTP/1.1
    Host: api.opentoken.io

This response describes what is required in order to create a set of access codes.

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Link: </>; rel="up"; title="self-discovery"
    Link: </schema/account/access-code-request.json>; rel="self"

    {
        "type": "object",
        "properties": {
            "description": {
                "type": "string"
            }
        },
        "required": []
    }

This is saying that you need to POST a JSON object that may have a `description` property. Let's create an access code pair with a description.

    POST /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/accessCode
    Host: api.opentoken.io
    Cookie: login=L2szF0mI3b.....NjbduJj74B

    {
        "description": "Example for Documentation"
    }

When the codes are created successfully, the response will have a 201 status code.

    HTTP/1.1 201 Created
    Content-Type: application/json
    Link: </>; rel="up"; title="self-discovery"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH>; rel="up"; title="account"

    {
        "code": "LTyPtAMrYarpdgPxHnIB-aXb5BXIxnf8",
        "expires": "2017-01-01T01:23:45.678Z",
        "secret": "GR6ytMoj1IGxAoBUmYKbVM9z5fZBduUi"
    }

This is the last time you will ever see the public `code` and the very private `secret` from the API. Make sure to keep them safe. They automatically expire, so make sure you have a process in place to easily update and regularly rotate keys. These codes are used to create [signed requests](signed-requests.md) for some actions, such as [tokenizing data](tokens.md).

[account]: account.md
