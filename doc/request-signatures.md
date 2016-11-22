Request Signatures
==================

In order to verify a request is being made with a valid Access Code Pair and to prevent forgeries, a request signature is used. The Access Code Pair refers to both the Public Code and the Secret Code. The Public Code is sent back to the API for identification, similar to a username. The Secret Code is never sent back to the API and is strictly used for signature generation.


Generation of Signed Content
----------------------------

When creating the signature, you must supply some content to sign. This must exactly match what the server builds.

Example content.

    POST
    /account/lCAvrWvrwhDBMNCSRoKsnm_P/token
    public=true
    host:api.opentoken.io
    content-type:text/plain
    x-opentoken-date:2016-10-11T22:30:55Z

    This is the body of the request.

This is the list of fields that comprise the content to sign. Each field is separated by a Unix-style newline (0x0a; the line-feed character)

    HTTP Method
    URI Path
    Query String
    Headers (one line per header)
    Blank Line
    Body Content


### HTTP Method

This will be "GET", "POST", "PUT" or other valid HTTP methods. It will always be in uppercase.


### URI Path

This one is fairly straightforward. The path of the URI starts at the first `/` after the hostname and stops at the end or at the `?` before the query string. When there is a query string, the `?` is not included in the path.


### Query String

When the URI contains a `?`, this would include everything after that symbol. The `?` is not included. If there is no query string, this line would be blank, as shown in this example.

*Note: Line feeds have been converted to `<LF>` so they are visible and help illustrate the blank line at the end of the request.*

    GET<LF>
    /account/lCAvrWvrwhDBMNCSRoKsnm_P/token/ImiHVTi-JtScNtsmrVPLtKbl<LF>
    <LF>
    host:api.opentoken.io<LF>
    content-type:text/plain<LF>
    x-opentoken-date:2016-10-11T22:30:55Z<LF>
    <LF>


### Headers

The headers that are signed are the only headers that are used in a signed request. Because of this, you must always include the `Host`, `Content-Type` and `X-OpenToken-Date` headers.

The header name is converted to all lowercase, a colon is added, and then the trimmed value is appended. The order is important and comes into play during the HTTP request.

The `X-OpenToken-Date` header must be a time that the server can parse and it must be within a few minutes of the current time, otherwise the request will be rejected.


### Blank Line

This line always exists and separates the headers from the body of the request, similar to how the HTTP request is transmitted with a blank line separating headers from the body.


### Body Content

This is the body of the message, verbatim. Do not include an additional newline at the end of the body unless you also send that in the HTTP request. For instance, most GET requests do not have a body, so the signed content should end with exactly two linefeed characters in a row.


Signing the Content
-------------------

Send the content to an HMAC generator using SHA256 as the hashing algorithm. The HMAC will be initialized with the Secret Code from the Access Code Pair. The generated signature needs to be lowercase hexadecimal characters.


Creating HTTP Request
---------------------

The HTTP request can now be generated with a couple additional headers. `Host`, `X-OpenToken-Date` and `Content-Type` are required. If you wish to send additional headers and have the API honor them, you will also need to add them to the signed content and ensure they are sent in the HTTP request.

An `Authorization` header needs to also be included. Its format:

    Authorization: OT1-HMAC-SHA256-HEX; access-code=MW-HNalDMRBxwggBw-Lnygcu; signed-headers=host content-type x-opentoken-date; signature=fd37b2bfd06690cb5cc36f9b4b112aeab354227a2922d72785a99d2000feea0f

The first value must be the signature method version. The rest are separated by semicolons and can be in any order.


### `OT1-HMAC-SHA256-HEX`

The signature method version (`OT1`), the hashing method (`HMAC`), the hashing algorithm (`SHA256`) and the encoding method (`HEX` = lowercase hexadecimal). This is the only valid combination.


### `access-code=....`

This is the public portion of the Access Code Pair. The server will look up the access code in order to get the Secret Code for the message signature generation.


### `signed-headers=host content-type x-opentoken-date`

Lowercase list of the headers that are signed. The order must match the order they are listed in the signed content. The header names are separated by a single space.


### `signature=...`

The signature in hexadecimal characters, all lowercase.


Example
-------

There is a working [shell script](../example/signed-request.sh) that requires a Bash shell (version 4) and a few common command-line utilities.
