"use strict";

xdescribe("account", () => {
    var test;

    beforeEach(() => {
        return jasmine.functionalTestAsync().then((result) => {
            test = result;
        });
    });
    it("allows login to the account", () => {
        return test.loginAsync().then(() => {
            // Need to ignore the returned value otherwise the test fails.
        });
    });
    it("creates access codes", () => {
        return test.createAccessCodesAsync().then(() => {
            // Need to ignore the returned value otherwise the test fails.
        });
    });
    it("tokenizes private data", () => {
        return test.createAccessCodesAsync().then((response) => {
            return test.followAsync(response, "up", "account", {
                headers: {
                    Cookie: `login=${test.state.sessionId}`
                }
            });
        }).then((response) => {
            return test.followAsync(response, "service", "account-tokenCreate", {
                body: "This is a test token",
                headers: {
                    "Content-Type": "text/plain"
                },
                parameters: {
                    "?public": ""
                },
                signed: true
            });
        }).then((response) => {
            if (response.statusCode !== 201) {
                throw new Error("Tokenization failed");
            }

            return test.followAsync(response, "self", {
                signed: true
            });
        }).then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.getHeader("Content-Type")).toBe("text/plain");
            expect(response.body.toString()).toBe("This is a test token\n");
        });
    });
    it("tokenizes public data", () => {
        return test.createAccessCodesAsync().then((response) => {
            return test.followAsync(response, "up", "account", {
                headers: {
                    Cookie: `login=${test.state.sessionId}`
                }
            });
        }).then((response) => {
            return test.followAsync(response, "service", "account-tokenCreate", {
                body: "This is a test token",
                headers: {
                    "Content-Type": "text/plain"
                },
                parameters: {
                    "?public": ""
                },
                query: {
                    public: "true"
                },
                signed: true
            });
        }).then((response) => {
            if (response.statusCode !== 201) {
                throw new Error("Tokenization failed");
            }

            // Unsigned request to ensure it is a public token.
            return test.followAsync(response, "self");
        }).then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.getHeader("Content-Type")).toBe("text/plain");
            expect(response.body.toString()).toBe("This is a test token\n");
        });
    });
});

