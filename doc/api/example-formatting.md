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

This is a mostly unformatted response.  The only modification was to wrap it to have shorter lines so it displays better.  The wrapped lines are indented so this is still a valid response.

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

This is the same response formatted as it would appear in the documentation.  Note that the `Link` header was split into separate lines for clarity.  It is easier to see where each link starts this way.

    HTTP/1.1 204 No Content
    Link: </>; rel="up"; title="self-discovery"
    Link: <https://api.opentoken.io/>; rel="self"
    Link: </account/{accountId}/login>; rel="service";
        profile="/schema/account/login-request.json";
        templated="true"; title="account-login"
    Link: </healthCheck>; rel="service"; title="health-check"
    Link: </registration>; rel="service";
        profile="/schema/registration/register-request.json";
        title="registration-register"
