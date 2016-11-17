Signed Requests
===============

Whenever you use these access codes, you are required to make signed requests.  This process ensures that the request is coming from an authenticated user and prevents replay attacks.  You will transmit the public `code` and use the private `secret` to generate the signature.

The signature process is broken down into small steps for this explanation.  First, you create a date stamp.  Next, some signed headers are formatted.  Next, some content that will be signed.  The [HMAC] of the content is calculated.  Lastly, the request has the right headers set.


Date Stamp
----------

Create a date stamp in [ISO 8601] format.  Specifically, we're looking for `yyyy-mm-ddThh:mm:ssZ` format.  It is used for an `X-OpenToken-Date` header.  Our example will use this date.

    2016-11-17T19:53:23Z

This date must be within a few minutes of the current time, so generate this date right before you submit the request.


Signed Headers
--------------

When sending a signed request, the server will only honor the headers that are signed.  This is to help prevent proxies from inserting additional headers or manipulating the request.  The `Host` header helps ensure the client knows where it is sending requests instead of having the requests redirected somehow.  The `Content-Type` header confirms that content isn't being injected or manipulated and is especially important for [tokenization](tokens.md).  Finally, an `X-OpenToken-Date` header is used to prevent replay attacks.

Let's format these headers now.  Order here must match the order specified in the `Authorization` header, discussed later.  All header names must be changed to lowercase.  Trim the header name by removing all whitespace (spaces, tabs, etc.) from the beginning and end.  Next, append a colon.  Finally, trim the header value but do not change it to all lowercase.

One special exception is that the `Host` header's value must be lowercase.  DNS is not case-sensitive and the `Host` header in the request could get mangled by a proxy.

The `X-OpenToken-Date` header's value will be the date stamp generated in the earlier step.

Join all the headers together with newlines between them.  They should look like our example.

    host:api.opentoken.io
    content-type:text/plain
    x-opentoken-date:2016-11-17T19:53:23Z

Other headers may be signed as well.  The three listed are mandatory.


Generate the Signing Content
----------------------------

In order for the signatures to match, both the server and the client must be signing the exact same content.  This content follows the following template.  Please note that all newline characters are Unix newlines, hex 0x0a.

    HTTP Verb + Newline
    URI Path + Newline
    Query String + Newline
    Formatted Headers + Newline
    Newline
    Body

The HTTP verb must be in all uppercase.

The URI path is everything after the hostname, including the first slash.  This must preserve the case.

The query string includes any optional parameters.  In URIs they appear after a `?`.  If you had a URI such as `https://api.opentoken.io/test?something=true`, then this line would be `something=true`.  It would not contain the `?`.

The formatted headers were generated in the previous section.

After the headers, there's a blank line, just like how the HTTP request itself is transmitted.

Finally, the body of the request is added, if there is a body.  No newlines are appended after the body.  If there is no request body, then nothing is appended.

Our example is trying tokenize some data, so we are issuing a POST to `https://api.opentoken.io/account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/token`.  The "This is a test." at the end is the content we are trying to tokenize.  There's a newline at the end of the request because that's part of the content we're tokenizing.

    POST
    /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/token

    host:api.opentoken.io
    content-type:text/plain
    x-opentoken-date:2016-11-17T19:53:23Z

    This is a test.

Here's the same signing content shown as a hex dump:

    00000000  50 4f 53 54 0a 2f 61 63  63 6f 75 6e 74 2f 57 32  |POST./account/W2|
    00000010  6c 36 48 30 76 45 68 64  75 72 72 68 53 44 4e 34  |l6H0vEhdurrhSDN4|
    00000020  56 6a 56 32 42 6c 67 53  49 43 70 76 45 48 2f 74  |VjV2BlgSICpvEH/t|
    00000030  6f 6b 65 6e 0a 0a 68 6f  73 74 3a 61 70 69 2e 6f  |oken..host:api.o|
    00000040  70 65 6e 74 6f 6b 65 6e  2e 69 6f 0a 63 6f 6e 74  |pentoken.io.cont|
    00000050  65 6e 74 2d 74 79 70 65  3a 74 65 78 74 2f 70 6c  |ent-type:text/pl|
    00000060  61 69 6e 0a 78 2d 6f 70  65 6e 74 6f 6b 65 6e 2d  |ain.x-opentoken-|
    00000070  64 61 74 65 3a 32 30 31  36 2d 31 31 2d 31 37 54  |date:2016-11-17T|
    00000080  32 30 3a 30 31 3a 30 30  5a 0a 0a 54 68 69 73 20  |20:01:00Z..This |
    00000090  69 73 20 61 20 74 65 73  74 2e 0a                 |is a test..|
    0000009b

It would be good to verify that your signatures are being generated the same as this document illustrates.  Instead of typing this in yourself, you can [download this file](signing-content.zip).  Extracting the archive will provide `example.txt`, which is the exact same content as above.


Calculate the [HMAC]
--------------------

This now passes through [HMAC] using SHA256 as the hash.  For reference, the signature of our example can be calculated using OpenSSL.

    $ openssl dgst -sha256 -hmac GR6ytMoj1IGxAoBUmYKbVM9z5fZBduUi example.txt
    HMAC-SHA256(example.txt)= fc16d5946385ba3f3e65d944f8d519008421681d9f6029698666abc90e52af5e
    $

The HMAC value is represented in hexadecimal and must be in lowercase.  Ensure your software generates the same HMAC as is shown above when used with the [example file](signing-content.zip) and the secret of `GR6ytMoj1IGxAoBUmYKbVM9z5fZBduUi`.


Setting Request Headers
-----------------------

We now have everything required to make the request.  The following HTTP headers need to be set.  Because they are being sent via HTTP, whitespace is allowed and the header's name is case-insensitive.

    Host: api.opentoken.io

This header is often automatically added by the library or tools that are used to make HTTP requests.

    Content-Type: text/plain

This header's value simply matches what was signed.  You can use other content types as needed.

    X-OpenToken-Date: 2016-11-17T19:53:23Z

This is the date that was generated at the beginning of this example.  It must be within a few minutes of the current time on the server.

    Authorization: OT1-HMAC-SHA256-HEX; access-code=LTyPtAMrYarpdgPxHnIB-aXb5BXIxnf8;
        signed-headers=host content-type x-opentoken-date;
        signature=fc16d5946385ba3f3e65d944f8d519008421681d9f6029698666abc90e52af5e

This is the signature.  It specifies the signature version (`OT1`), method (`HMAC`), algorithm (`SHA256`), and encoding (`HEX`).  Your public access code is provided so the server can look up the secret code.  Next up is the list of signed headers.  It must match the order they were listed in the signed content.  The last portion of the header is the signature.

[account]: account.md
[HMAC]: https://tools.ietf.org/html/rfc2104f
