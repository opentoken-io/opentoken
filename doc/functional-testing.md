Functional Testing
==================

Functional testing exercises far more of the software than unit tests, though it is difficult to get the API up and in a working state.  There are Jasmine test helpers that were created to make this as easy as possible for tests.


Getting Started
---------------

You must instantiate a functional test object in your `beforeEach()` of your test suite.  This is done asynchronously because the server needs to be bootstrapped and that's an asynchronous process.

    var test;

    beforeEach(() => {
        return jasmine.functionalTestAsync().then((result) => {
            test = result;
        });
    });

Tests simulating API requests can be initiated by several of the `FunctionalTest` object's methods.  Here is a simple request to the API's health check endpoint.

    it("says the server is running", () => {
        return test.startAsync("service, "health-check").then((response) => {
            expect(response.body).toEqual({
                status: "healthy"
            });
            expect(response.statusCode).toBe(200);
        });
    });

As was done in the `beforeEach()`, this is asynchronous and so it returns a promise, which resolves in a special response object.


Request Options
---------------

Functions that make requests allow options to be passed in with the request, controlling additional data that would be sent or simulated through the API.  The options objects may have the following properties and it is passed (with modifications) to the request mock library.

* `.body` - Extra information to send in the body of a request.  If this is set, the `.method` property will default to `"POST"`.  Also, the `Content-Type` header defaults to `"application/json"`.

* `.headers` - Object hash containing extra headers.  This is created if it doesn't exist.  The `Host` header defaults to `"localhost"`.

* `.method` - Typically `"GET"` or `"POST"`.  Often the default is correct.

* `.parameters` - Object hash containing key/value pairs.  If the `.url` property contains the string `{key}` (the key name), then that string will be replaced with the value.  It isn't true URI templating at this point.

* `.query` - Object has of additional query string values to append to the `.url` property.

* `.signed` - If true, the request will be signed before being sent.  This involves setting a `Content-Type` header if one was not set and assigning both `X-OpenToken-Date` and `Authorization`.  Only set this option after creating access codes.

* `.url` - The URI to request.

There are additional properties that may or may not work that are defined in the mock.


Response Objects
----------------

The response object is a simple Object and has the following properties:

* `.body` - Can be anything, including objects.  Its value is what was passed to `res.send()`.  It does not pass through Restify's formatters and will not automatically be changed into a Buffer.

* `.headers` - Object hash containing key/value header pairs.  Because headers are case insensitive but are stored in a case sensitive object, `functionalTest.getHeader()` may help you find if a specific header exists.

* `.links` - The "Link" header reformatted as an object.  Follows the format of the `parse-link-header` module.

* `.statusCode` - A number indicating if the response was a success or failure.  This is the HTTP status code, so 2xx level responses (200, 201, etc) are success.  3xx levels are client errors, 4xx mean it is missing, 5xx level are server errors.

* `.uri` - The request URI.


Functional Test Instance Methods
--------------------------------

This uses smoke and mirrors to hide the inner workings of the magic, leaving the audience amazed.


### `Buffer = test.coerseToBuffer(value)`

Converts `value` into a buffer object.  Used internally to convert information before signing and before making the request.

    var buff;

    buff = test.coerseToBuffer({});  // Objects
    buff = test.coerseToBuffer("string");  // Strings
    buff = test.coerseToBuffer(buff);  // Buffers


### `Promise<response> = test.createAccessCodesAsync()`

Creates a new set of access codes by starting a session (if needed) and making the necessary API calls.  Assigns them to `this.state.accessCode` and `this.state.accessSecret`.

Every response is checked and the promise will be rejected if there's any snags along the way.

    it("creates access codes", () => {
        return test.createAccessCodesAsync().then((response) => {
            test.debug(respnose);
        });
    });


### `Promise<response> = test.createAccountAsync()`

Creates an account by going through the registration process, including intercepting the registration email.  Assigns `this.state.registrationId`, `this.state.confirmationId` and `this.state.accountId`.

All responses are checked to ensure they are valid.  Any failed request will reject the promise with a descriptive error message.

    it("creates an account", () => {
        return test.createAccountAsync().then((response) => {
            test.debug(respnose);
        });
    });


### `test.debug(response)`

Logs a bunch of information about a response.  Only useful when you are figuring out what's going on with the requests and responses.  All of the output is directed to the console via `console.log` with a tinge of color to make it stand out.

    test.loginAsync().then((response) => {
        test.debug(response);
    });


### `linkDefinition = test.findLink(links, rel, [title])`

Searches the links and returns a single link definition given the link relation and optionally the link title.  Returns an `Error` object where there are no matching links or too many matching links.

    it("finds the \"self\" link", () => {
        return test.loginAsync().then((response) => {
            var linkDefinition;

            linkDefinition = test.findLink(response.links, "self");
            expect(linkDefinition).not.toEqual(jasmine.any(Error));
        });
    });


### `Promise<response> = then.followAsync(response, rel, [title], [options])`

When given the response from a previous request, follow one of the links and make another request.  This function is very handy, especially since all of the requests in the API should follow links.  The `rel` and `title` are passed directly to `.findLink()`.  The `options`, when specified, are sent to `.requestAsync()`.

Any error from `.findLink()` will reject the returned promise.  Otherwise, the promise is resolved or rejected by `.requestAsync()`.

    it("requests the health check service", () => {
        return test.startAsync().then((response) => {
            return test.follow(response, "service", "health-check");
        });
    });


### `* = test.getHeader(headers, headerName)`

Searches the `headers` object for a case-insensitive match to `headerName`.  This is necessary because the headers are technically case insensitive but JavaScript has case sensitive object property names and case sensitive string comparisons.

When there is no match, `null` is returned instead.

    var headers;

    headers = {
        "Content-Type": "text/plain"
    };
    console.log(test.getHeader(headers, "Content-Type")); // works
    console.log(test.getHeader(headers, "content-type")); // works
    console.log(test.getHeader(headers, "CONTENT-TYPE")); // works
    console.log(test.getHeader(headers, "ContentType")); // fail


### `Promise<response> = test.loginAsync()`

Initiates a login.  If there is no account created yet, this first creates an account.  Assigns `this.state.sessionId`, which can be used manually to simulate requests that occur during a logged in session.

Checks for errors along the way and rejects the promise when anything goes wrong.

    it("simulates logged in sessions", () => {
        return test.loginAsync().then((response) => {
            return this.followAsync(response, "up", "account", {
                headers: {
                    Cookie: `login=${test.state.sessionId}`
                }
            });
        });
    });


### `test.reformatRequestOptions(options)`

Modifies the `options` object so it is in an expected format for the mock request.  Sets several properties and defaults many values.  Assists with URI generation by replacing parameters and appending query string values.

Probably not something that should be called externally.


### `Promise<response> = test.requestAsync(options)`

Initiates the fake request.  It does this by first setting up a couple mocks and changing the options that were supplied into a set the mocks require.

From here, it makes a promise, fixes a few problems created by a conflict between Restify and the mocks, then starts the request.  Events are simulated to send any body on the request and the response events are captured to resolve the promise.  A timer is also started, helping to ensure tests do not run for too long.  The promise is resolved if there is any response and is rejected only if the timer expires.

If you wanted to peek behind the curtain, this is where the Wizard hides.

One should not call `.requestAsync()` directly because it violates a principle of the API when you directly hit URIs.  One valid situation is where you have the email confirmation during registration because there is no `Link` header that would be followed.

    it("allows direct requests", () => {
        return test.requestAsync({
            url: "/path/to/file"
        }).then((response) => {
            test.debug(response);
        });
    });


### `signRequest(options)`

Uses the saved access codes to generate a cryptographic signature hash of the current request.  Modifies the `options` object directly.  You probably do not want to run this.

    options = {
        body: "Some content"
    }

    signRequest(options);


### `Promise<response> = startAsync([rel], [title], [options])`

Calls the self discovery endpoint, which should be the basis of all operations with the API.  If a `rel` is specified, then this automatically calls `.follow()`, passing along the link relation, title and options.  The promise is rejected either by a failed self discovery request (probably not going to happen) or by the call to `.follow()`.

    it("calls the self discovery endpoint", () => {
        return test.startAsync().then((response) => {
            test.debug(response);
        });
    });
