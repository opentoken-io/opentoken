Logging Out of a Session
========================

After you've logged into an [account](account.md), you can follow the `account-logout` link to destroy the current session.  First, let's get the associated profile.

    GET /schema/account/logout-request.json HTTP/1.1
    Host: api.opentoken.io

This response may surprise you.

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Link: </>; rel="up"; title="self-discovery"
    Link: </schema/account/logout-request.json>; rel="self"

    {}

Nothing.  The profile says it does not need any data.  How interesting.  You can use GET or POST to follow the link to the service and both will log you out.

    POST /account/W2l6H0vEhdurrhSDN4VjV2BlgSICpvEH/logout HTTP/1.1
    Host: api.opentoken.io
    Cookie: login=L2szF0mI3b.....NjbduJj74B

And the associated response simply removes the cookie from your side and destroys the session information on the server.  Because of the asynchronous nature, the server-side information may not be removed instantly.

    HTTP/1.1 204 No Content
    Set-Cookie: login=; .....
    Link: </>; rel="up"; title="self-discovery"
    Location: /

