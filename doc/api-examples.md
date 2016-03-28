Self discovery.  This returns link relations to other services that are exposed to the client.


    GET / HTTP/1.1
    ----
    204 No Content
    Link: <https://example.com/>; rel="self"
    Link: <https://example.com/authenticate>; rel="service"; method="post"; profile="/schemas/authenticate"; title="authenticate"
    ... no-cache headers
    .... Probably not more here


You will see the `Link` headers here.  They describe relations to other documents on this server.  The `Link` headers could be several individual headers or served with multiple links on a single header (or any combination of the two).  There's a very in-depth discussion of this on a [GitHub issue](https://github.com/kennethreitz/requests/issues/741) if you want to obtain further information.

The "self" link is proposed by HAL and is reserved by IANA to mean the URL used to request this document.  The "service" link that you see above is for authentication.  An API consumer should find the right link to use by checking the `rel` and the `title`.  The `profile` is a URL that describes what data to send for a given endpoint in JSON Schema.

We can authenticate with a username and password in this example.  Please keep in mind that this is to illustrate roughly how the API works and does not go into all of the detail, nor will the examples work if you copy and use them directly.


    GET /schemas/authenticate HTTP/1.1
    Accept: *
    ----
    200 Ok
    Link: <https://example.com/schemas/authenticate>; rel="self"
    Content-Type: application/json
    ETag: ... Fill me in
    ... Allow caching based on etag

    {
        "type": "object",
        "properties": {
            "username": {
                "type": "string",
                "required": true
            },
            "password": {
                "type": "string",
                "required": true
            }
        }
        "$schema": "http://json-schema.org/draft-04/schema#"
    }


With this we can figure out where to post our data and the format that's acceptable by the server.  It is expecting an object with two properties, `username` and `password`.

    POST /authenticate HTTP/1.1
    Content-Type: application/json

    {
        "username": "mooo",
        "password": "cows rule"
    }
    ----
    204 No Content
    Set-Cookie: auth=4f52a029b5a1eb1eb127ce65b7ad3e2ad7698533b1e86f07b39037995ec82055; domain=example.com; path=/; secure; http_only
    ... no-cache headers


This looks like it succeeded.  Cookie has our **temporary** key and it will expire.  Getting the self discovery endpoint with the cookie will show different links.


    GET / HTTP/1.1
    Cookie: auth=4f52a029b5a1eb1eb127ce65b7ad3e2ad7698533b1e86f07b39037995ec82055
    ----
    204 No Content
    Link: <https://example.com/>; rel="self"
    Link: <https://example.com/restricted-service>; rel="restricted-service"
    Link: <https://example.com/account/d074c7cc15232f707e6944989bf3d891/tokenize{?*}>; rel="service"; title="tokenize"; profile="/schemas/tokenize"; templated="true"; method="post"
    Link: <https://example.com/account/d074c7cc15232f707e6944989bf3d891/encrypt{?*}>; rel="service"; title="encrypt"; profile="/schemas/encrypt"; templated="true"; method="post"
    Link: <https://example.com/account/d074c7cc15232f707e6944989bf3d891/decrypt>; rel="service"; title="decrypt"; templated="true"; method="post"
    ... no-cache headers
    .... More here


Ok, so now we have to tokenize something.  We now look for the "service" `rel` with the `title` of "tokenize".  We should also inspect the profile to make sure we are sending the right data.


    GET /schemas/tokenize
    Accept: *
    ----
    200 Ok
    Content-Type: application/json
    Link: <https://example.com/schemas/tokenize>; rel="self"
    ETag: ... Fill me in
    ... Allow caching based on etag

    {
        "expires": {
            "type": "string"
            .... more here
        },
        "retrieveLimit": {
            "type": "integer",
            "min": 1
        }
    }

Ok, so the profile doesn't say how to save data.  Let's just throw data at it.


    POST /account/d074c7cc15232f707e6944989bf3d891/tokenize
    Cookie: auth=4f52a029b5a1eb1eb127ce65b7ad3e2ad7698533b1e86f07b39037995ec82055
    Content-Type: application/vnd.my-custom-type

    Testing content.  Note that the Content-Type header also is preserved with the content.
    ----
    201 Created
    Location: https://example.com/account/d074c7cc15232f707e6944989bf3d891/token/bab4bc9938c8483c200eb1863488b356
    Link: <https://example.com/account/d074c7cc15232f707e6944989bf3d891/tokenize>; rel="self"
    ... no-cache headers


We get back the token as a `Location` header.  To retrieve the data we must issue a `GET` to that location.


    GET https://example.com/account/d074c7cc15232f707e6944989bf3d891/token/bab4bc9938c8483c200eb1863488b356
    Cookie: auth=4f52a029b5a1eb1eb127ce65b7ad3e2ad7698533b1e86f07b39037995ec82055
    ----
    200 Ok
    Content-Type: application/vnd.i-dont-care
    Link: <https://example.com/account/d074c7cc15232f707e6944989bf3d891/token/bab4bc9938c8483c200eb1863488b356>; rel="self"
    ... no-cache headers
    Content-Type: application/vnd.my-custom-type

    Testing content.  Note that the Content-Type header also is preserved with the content.


How do we say it should expire?  Query parameters.  That's what the profile and the templated URL indicated.


    POST /account/d074c7cc15232f707e6944989bf3d891/tokenize?expire=YYYY-MM-DDThh:mm:ssZ
    Cookie: auth=4f52a029b5a1eb1eb127ce65b7ad3e2ad7698533b1e86f07b39037995ec82055
    Content-Type: application/json

    {
        "message": "The content of the payload is preserved exactly."
    }
    ----
    201 Created
    Location: https://example.com/account/d074c7cc15232f707e6944989bf3d891/token/fc499f2f68fd5fb0210c210d0ebb7d7c
    Link: <https://example.com/account/d074c7cc15232f707e6944989bf3d891/tokenize>; rel="self"
    ... no-cache headers


References:

* [JSON Hypertext Application Language (HAL)](https://tools.ietf.org/html/draft-kelly-json-hal-06) - Defines link attributes how they should be used.
* [JSON Hyper-Schema](http://json-schema.org/latest/json-schema-hypermedia.html) - Goes into additional link attributes.
* [Link Relations (IANA)](http://www.iana.org/assignments/link-relations/link-relations.xhtml) - The authoritive, though not definitive nor restrictive list of link relations.
* [URI Template](https://tools.ietf.org/html/rfc6570) - How to template URLs and how templating works.
* [Web Linking](https://tools.ietf.org/html/rfc5988) - How the `Link` header works.