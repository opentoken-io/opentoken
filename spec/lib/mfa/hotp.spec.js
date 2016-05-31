"use strict";

describe("mfa/hotp", () => {
    var hotp, promiseMock, twofaMock;

    beforeEach(() => {
        var config;

        config = {
            hotp: {
                keySize: 256
            }
        };
        promiseMock = require("../../mock/promise-mock")();
        twofaMock = jasmine.createSpyObj("twofaMock", [
            "generateKey",
            "generateGoogleQR",
            "verifyTOTP"
        ]);
        twofaMock.generateKey.andCallFake((size, cb) => {
            cb(null, "thisIsAReallyLongKeyForMFA");
        });
        twofaMock.generateGoogleQR.andCallFake((name, email, key, cb) => {
            cb(null, "data:image/png;base64,iVBORw0KGgoA....5CYII=");
        });
        hotp = require("../../../lib/mfa/hotp")(config, twofaMock, promiseMock);
    });
    describe(".generateSecretAsync()", () => {
        it("returns a key with 256 length set in config", (done) => {
            hotp.generateSecretAsync().then((result) => {
                expect(result).toBe("thisIsAReallyLongKeyForMFA");
                expect(twofaMock.generateKey).toHaveBeenCalledWith(256, jasmine.any(Function));
            }).then(done, done);
        });
        it("returns a key without config value set", (done) => {
            var hotpLocal;

            hotpLocal = require("../../../lib/mfa/hotp")({}, twofaMock, promiseMock);
            hotpLocal.generateSecretAsync().then((result) => {
                expect(result).toBe("thisIsAReallyLongKeyForMFA");
                expect(twofaMock.generateKey).toHaveBeenCalledWith(128, jasmine.any(Function));
            }).then(done, done);
        });
    });
    describe(".generateQRCodeAsync()", () => {
        it("returns data for a qr code", (done) => {
            hotp.generateQrCodeAsync("secretKey", "some.one@example.net").then((result) => {
                expect(result).toBe("data:image/png;base64,iVBORw0KGgoA....5CYII=");
                expect(twofaMock.generateGoogleQR).toHaveBeenCalledWith("OpenToken.io", "some.one@example.net", "secretKey", jasmine.any(Function));
            }).then(done, done);
        });
        it("returns data for a qr code without qr code", (done) => {
            hotp.generateQrCodeAsync("secretKey").then((result) => {
                expect(result).toBe("data:image/png;base64,iVBORw0KGgoA....5CYII=");
                expect(twofaMock.generateGoogleQR).toHaveBeenCalledWith("OpenToken.io", "", "secretKey", jasmine.any(Function));
            }).then(done, done);
        });
        it("has a different application name", (done) => {
            var hotpLocal;

            hotpLocal = require("../../../lib/mfa/hotp")({
                hotp: {
                    name: "opentoken.io alternate name"
                }
            }, twofaMock, promiseMock);
            hotpLocal.generateQrCodeAsync("secretKey").then(() => {
                expect(twofaMock.generateGoogleQR).toHaveBeenCalledWith("opentoken.io alternate name", "", "secretKey", jasmine.any(Function));
            }).then(done, done);
        });
    });
    describe(".verifyToken()", () => {
        it("returns true from a valid check", () => {
            twofaMock.verifyTOTP.andReturn(true);
            expect(hotp.verifyToken("secretKey", "054643")).toBe(true);
            expect(twofaMock.verifyTOTP.mostRecentCall.args[2]).toEqual({
                beforeDrift: 0
            });
        });
        it("returns false from a invalid check", () => {
            twofaMock.verifyTOTP.andReturn(false);
            expect(hotp.verifyToken("secretKey", "054643")).toBe(false);
        });
        it("passes in options for previous", () => {
            twofaMock.verifyTOTP.andReturn(true);
            expect(hotp.verifyToken("secretKey", "054643", 1)).toBe(true);
            expect(twofaMock.verifyTOTP.mostRecentCall.args[2]).toEqual({
                beforeDrift: 1
            });
        });
    });
});
