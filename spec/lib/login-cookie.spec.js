"use strict";

describe("loginCookie", () => {
    var loginCookie, reqMock, resMock;

    /**
     * Test if a cookie was set to the right value
     *
     * @param {string} value
     */
    function expectCookieSet(value) {
        expect(resMock.setCookie).toHaveBeenCalledWith("name of cookie", value, {
            what: "cookie settings"
        });
    }

    beforeEach(() => {
        var fakeConfig;

        fakeConfig = {
            account: {
                loginCookie: {
                    name: "name of cookie",
                    settings: {
                        what: "cookie settings"
                    }
                }
            }
        };
        reqMock = require("../mock/request-mock")();
        resMock = require("../mock/response-mock")();
        loginCookie = require("../../lib/login-cookie")(fakeConfig);
    });
    describe(".clear()", () => {
        it("clears when a cookie is set", () => {
            reqMock.cookies["name of cookie"] = "something";
            loginCookie.clear(reqMock, resMock);
            expectCookieSet("");
        });
        it("takes no action when a cookie is not set", () => {
            loginCookie.clear(reqMock, resMock);
            expect(resMock.setCookie).not.toHaveBeenCalled();
        });
    });
    describe(".get()", () => {
        it("returns a cookie that exists", () => {
            reqMock.cookies["name of cookie"] = "something";
            expect(loginCookie.get(reqMock)).toBe("something");
        });
        it("returns undefined when the cookie does not exist", () => {
            expect(loginCookie.get(reqMock)).not.toBeDefined();
        });
    });
    describe(".refresh()", () => {
        it("refreshes an existing cookie", () => {
            reqMock.cookies["name of cookie"] = "something";
            loginCookie.refresh(reqMock, resMock);
            expectCookieSet("something");
        });
        it("throws when a cookie does not exist", () => {
            expect(() => {
                loginCookie.refresh(reqMock, resMock);
            }).toThrow();
            expect(resMock.setCookie).not.toHaveBeenCalled();
        });
    });
    describe(".set()", () => {
        it("sets a cookie", () => {
            loginCookie.set(resMock, "val");
            expectCookieSet("val");
        });
        it("sets an empty value", () => {
            loginCookie.set(resMock, "");
            expectCookieSet("");
        });
    });
});
