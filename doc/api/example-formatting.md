Example Formatting
==================

Examples are simplified and formatted to aid in readability.

* Link headers are separated and wrapped to 80 characters.
* Unrelated headers, such as User-Agent and Accept, are omitted from the request.
* The Date and caching headers are omitted from the response.


Sample Request
--------------

This is the real request.

    GET / HTTP/1.1
    Host: api.opentoken.io
    User-Agent: curl/7.50.1
    Accept: */*

In documented examples, only these headers are listed.

    GET / HTTP/1.1
    Host: api.opentoken.io


Sample Response
---------------

This response is mostly not formatted.  The only modification was to wrap it to have shorter lines so it displays better.  The wrapped lines are indented so this is still a valid response.

    HTTP/1.1 204 No Content
    Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
    Date: Thu, 20 Oct 2016 09:46:19 GMT
    Expires: 0
    Link: </>; rel="up"; title="self-discovery", <https://api.opentoken.io/>;
        rel="self", </account/{accountId}/login>; rel="service";
        profile="/schema/account/login-request.json"; templated="true";
        title="account-login", </healthCheck>; rel="service";
        title="health-check", </registration>; rel="service";
        profile="/schema/registration/register-request.json";
        title="registration-register"
    Pragma: no-cache
    Surrogate-Control: no-store
    X-Content-Type-Options: nosniff
    X-Download-Options: noopen
    X-Frame-Options: DENY
    X-XSS-Protection: 1; mode=block
    Connection: keep-alive

This is the same response formatted as it would appear in the documentation.  Note that the `Link` header was split into separate lines for clarity and the links may have been shortened.  It is easier to see where each link starts this way.

    HTTP/1.1 204 No Content
    Link: </>; rel="up"; title="self-discovery"
    Link: </>; rel="self"
    Link: </account/{accountId}/login>; rel="service";
        profile="/schema/account/login-request.json";
        templated="true"; title="account-login"
    Link: </healthCheck>; rel="service"; title="health-check"
    Link: </registration>; rel="service";
        profile="/schema/registration/register-request.json";
        title="registration-register"

Likewise, if the response contains JSON, the JSON will be formatted to be more appealing to read.  Here's an unformatted example.

    HTTP/1.1 200 OK
    Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
    Content-Type: application/json
    Date: Tue, 15 Nov 2016 17:54:30 GMT
    Expires: 0
    Link: </>; rel="up"; title="self-discovery",
        <https://api.opentoken.io/health-check>; rel="self"
    Pragma: no-cache
    Surrogate-Control: no-store
    X-Content-Type-Options: nosniff
    X-Download-Options: noopen
    X-Frame-Options: DENY
    X-XSS-Protection: 1; mode=block
    Content-Length: 21
    Connection: keep-alive

    {"status":"healthy"}

And the same response after it is reformatted to look better.

    HTTP/1.1 200 OK
    Link: </>; rel="up"; title="self-discovery"
    Link: </healthCheck>; rel="self"

    {
        "status": "healthy"
    }

Before you go much further, I suggest you read up about the vitally important [link headers](links.md) and how services are intended to be located only through [self discovery](self-discovery.md) instead of remembering URIs.
