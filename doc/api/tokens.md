Tokens
======

Tokens can only be created by using [access code pairs](access-codes.md).  They are associated with a single [account][account].


Tokenization of Data
--------------------

Any type of information can be tokenized.  Content does not matter to the API and your `Content-Type` header is preserved with the tokenized data.  The account-specific tokenization link can be found through [self-discovery](self-discovery.md) and it is also available with the [account resource][account].

It has an associated profile, so let's get it now.  It will help us immensely for the templated URI.

    GET /schema/account/token-create-request.json HTTP/1.1
    Host: api.opentoken.io

The response gives us a JSON schema.

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Link: </>; rel="up"; title="self-discovery"
    Link: </schema/account/token-create-request.json>; rel="self"

    {
        "type": "object",
        "properties": {
            "public": {
                "type": "string",
                "description": "If set to true, the token will be made public.  Default is 'false'.",
                "enum": [
                    "false",
                    "true"
                ]
            }
        },
        "required": []
    }

This explains the end of the URL and indicates that we can optionally send a `?public=true` or `?public=false` at the end of the URI when creating a token.  Let's send a bit of a test right now.  This must use a [signed request] using [access code pairs](access-codes.md).

    POST /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/token
    Host: api.opentoken.io
    Content-Type: text/plain
    Authorization: OT1-HMAC-SHA256-HEX; access-code=LTyPtAMrYarpdgPxHnIB-aXb5BXIxnf8;
        signed-headers=host content-type x-opentoken-date;
        signature=759c568001d7628ff88e921c363eb5d85afeda56f37672e11f51b6c9f214d900
    X-OpenToken-Date: 2017-01-23T01:23:45Z

    This is a test.

The result will indicate the new token's location.

    HTTP/1.1 201 Created
    Link: </>; rel="up"; title="self-discovery"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/token/_w5Szy6iBY2O6ECVZGSso6-qP6CECRDs>; rel="self"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH>; rel="up"; title="account"
    Location: /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/token/_w5Szy6iBY2O6ECVZGSso6-qP6CECRDs

The token's location is specified by both a link header and the `Location` header.  Fetching the token returns the original data and the original content type.  The request must be [signed][signed request] and sent to the right location.

    GET /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/token/_w5Szy6iBY2O6ECVZGSso6-qP6CECRDs
    Host: api.opentoken.io
    Content-Type: text/plain
    Authorization: OT1-HMAC-SHA256-HEX; access-code=LTyPtAMrYarpdgPxHnIB-aXb5BXIxnf8;
        signed-headers=host content-type x-opentoken-date;
        signature=bc381a2957f6e1366d3f3cb1acf5e8f8714832d0892924c0c8430ec3e804181d
    X-OpenToken-Date: 2017-01-23T01:23:45Z

Because everything works, we are provided the original information.

    HTTP/1.1 200 OK
    Content-Type: text/plain
    Link: </>; rel="up"; title="self-discovery"
    Link: </account/4xA-GqsWaUT-rEsDHRESKQoamryLdEcZ/token/_w5Szy6iBY2O6ECVZGSso6-qP6CECRDs>; rel="self"
    Link: </account/4xA-GqsWaUT-rEsDHRESKQoamryLdEcZ>; rel="up"; title="account"

    This is a test.


Tokenization of Public Data
---------------------------

It may be desirable to have unauthenticated clients retrieve the tokenized information.  The process is nearly identical to tokenizing private information.  The important part is adding the `?private=true` at the end of the URI when tokenizing information.  Creating a public token still requires a [signed request].

    POST /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/token?public=true
    Host: api.opentoken.io
    Content-Type: text/plain
    Authorization: OT1-HMAC-SHA256-HEX; access-code=LTyPtAMrYarpdgPxHnIB-aXb5BXIxnf8;
        signed-headers=host content-type x-opentoken-date;
        signature=870212a7aa5f198048e4bf2f53c57afd179ad6ff73b9e751c1f819fee9a431b0
    X-OpenToken-Date: 2017-01-23T01:23:45Z

    This is public.

The result will indicate the new token's location.

    HTTP/1.1 201 Created
    Link: </>; rel="up"; title="self-discovery"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/token/x5T2J0kV2dqbJLeT9G42wex69H7zkJch>; rel="self"
    Link: </account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH>; rel="up"; title="account"
    Location: /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/token/x5T2J0kV2dqbJLeT9G42wex69H7zkJch

With public tokens, anyone can request them.

    GET /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/token/x5T2J0kV2dqbJLeT9G42wex69H7zkJch
    Host: api.opentoken.io

And the response is the original information, as expected.

    HTTP/1.1 200 OK
    Content-Type: text/plain
    Link: </>; rel="up"; title="self-discovery"
    Link: </account/4xA-GqsWaUT-rEsDHRESKQoamryLdEcZ/token/x5T2J0kV2dqbJLeT9G42wex69H7zkJch>; rel="self"
    Link: </account/4xA-GqsWaUT-rEsDHRESKQoamryLdEcZ>; rel="up"; title="account"

    This is public.

[Account]: account.md
[Signed Request]: signed-requests.md