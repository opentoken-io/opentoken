"use strict";

describe("mfa/totp", () => {
    var factory, twofaAsyncMock;

    beforeEach(() => {
        var promiseMock, randomMock;

        factory = (override) => {
            var config;

            override = override || {};
            config = {
                mfa: {
                    totp: {
                        keyLength: override.keyLength || 99,
                        name: override.name || "Testing Name"
                    }
                }
            };

            return require("../../../lib/mfa/totp")(config, randomMock, twofaAsyncMock);
        };

        promiseMock = require("../../mock/promise-mock")();
        randomMock = require("../../mock/random-mock")();
        twofaAsyncMock = jasmine.createSpyObj("twofaAsyncMock", [
            "generateGoogleQRAsync",
            "generateUrl",
            "verifyTOTP"
        ]);
        twofaAsyncMock.generateGoogleQRAsync.andReturn(promiseMock.resolve(new Buffer("png data", "binary")));
        twofaAsyncMock.generateUrl.andReturn("twofaAsyncMock.generateUrl()");
        twofaAsyncMock.verifyTOTP.andReturn(true);
    });
    describe(".generateSecretAsync()", () => {
        it("returns a generated key", (done) => {
            factory().generateSecretAsync().then((result) => {
                expect(Buffer.isBuffer(result)).toBe(true);
                expect(result.length).toBe(99);
            }).then(done, done);
        });
    });
    describe(".generateQRCodeAsync()", () => {
        it("returns a PNG in a Buffer", (done) => {
            factory().generateQrCodeAsync("secret", "email").then((result) => {
                expect(result instanceof Buffer).toBe(true);
                expect(result.toString("binary")).toBe("png data");
                expect(twofaAsyncMock.generateGoogleQRAsync).toHaveBeenCalledWith("Testing Name", "email", "secret", {
                    encoding: "buffer"
                });
            }).then(done, done);
        });
    });
    describe(".generateUrl()", () => {
        it("generates a URL by calling the library", () => {
            expect(factory().generateUrl("secret", "email")).toBe("twofaAsyncMock.generateUrl()");
            expect(twofaAsyncMock.generateUrl).toHaveBeenCalledWith("Testing Name", "email", "secret");
        });
    });
    describe(".verifyCurrent()", () => {
        it("returns true when valid", () => {
            expect(factory().verifyCurrent("secret", "current")).toBe(true);
        });
        it("returns false when invalid", () => {
            twofaAsyncMock.verifyTOTP.andReturn(false);
            expect(factory().verifyCurrent("secret", "current")).toBe(false);
        });
    });
    describe(".verifyCurrentAndPrevious()", () => {
        var currentValid, previousValid;

        beforeEach(() => {
            twofaAsyncMock.verifyTOTP.andCallFake((secret, code) => {
                expect(secret).toBe("secret");

                if (code === "current") {
                    return currentValid;
                }

                return previousValid;
            });
        });
        it("passes if both codes are valid", () => {
            currentValid = true;
            previousValid = true;
            expect(factory().verifyCurrentAndPrevious("secret", "current", "previous")).toBe(true);
        });
        it("fails if both codes are invalid", () => {
            currentValid = false;
            previousValid = false;
            expect(factory().verifyCurrentAndPrevious("secret", "current", "previous")).toBe(false);
        });
        it("fails if current is invalid", () => {
            currentValid = false;
            previousValid = true;
            expect(factory().verifyCurrentAndPrevious("secret", "current", "previous")).toBe(false);
        });
        it("fails if previous is invalid", () => {
            currentValid = true;
            previousValid = false;
            expect(factory().verifyCurrentAndPrevious("secret", "current", "previous")).toBe(false);
        });
    });
});
