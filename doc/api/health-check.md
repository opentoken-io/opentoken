Health Check
============

The `health-check` service that is found through [self discovery](self-discovery.md) is a very simple endpoint.  It returns a successful response when the API appears to be working.  It does not perform a thorough check because it is designed to be called very often.

Sample request:

    GET /healthCheck HTTP/1.1
    Host: api.opentoken.io

Sample response when things are working:

    HTTP/1.1 200 OK
    Content-Type: application/json
    Link: </>; rel="up"; title="self-discovery"
    Link: </healthCheck>; rel="self"

    {"status":"healthy"}

When there are problems, the API either will not be listening for HTTP requests or else this route will not return a 2xx status code.