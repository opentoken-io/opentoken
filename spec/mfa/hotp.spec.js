"use strict";

describe("HOTP", () => {
    var hotp, twofaMock, promiseMock;

    beforeEach(() => {
        var HOTP;

        HOTP = require("../../lib/mfa/hotp");
        promiseMock = require("../mock/promise-mock");
        twofaMock = jasmine.createSpyObj("twofaMock", [
            "generateKeyAsync",
            "generateGoogleQRAsync",
            "verifyTOTP"
        ]);
        [
            "generateKeyAsync",
            "generateGoogleQRAsync",
            "verifyTOTP"
        ].forEach((method) => {
            twofaMock[method] = jasmine.createSpy("twofaMock" + method);
        });
        twofaMock.generateKeyAsync.andCallFake(() => {
            return promiseMock.resolve(
                "thisIsAReallyLongKeyForMFA"
            );
        });
        twofaMock.generateGoogleQRAsync.andCallFake(() => {
            return promiseMock.resolve(
                "data:image/png;base64,iVBORw0KGgoA....5CYII="
            );
        });
        hotp = new HOTP(twofaMock, promiseMock);
    });
    describe(".generateSecretAsync()", () => {
        it("returns a key at the proper length", (done) => {
            hotp.generateSecretAsync().then((result) => {
                expect(result).toBe("thisIsAReallyLongKeyForMFA");
            }).then(done, done);
            expect(twofaMock.generateKeyAsync).toHaveBeenCalledWith(128);
        });
    });
    describe(".generateQRCodeAsync()", () => {
        it("returns data for a qr code", (done) => {
            hotp.generateQrCodeAsync("secretKey", "some.one@example.net").then((result) => {
                expect(result).toBe("data:image/png;base64,iVBORw0KGgoA....5CYII=");
            }).then(done, done);
            expect(twofaMock.generateGoogleQRAsync).toHaveBeenCalledWith("OpenToken IO", "some.one@example.net", "secretKey");
        });
        it("returns data for a qr code without qr code", (done) => {
            hotp.generateQrCodeAsync("secretKey").then((result) => {
                expect(result).toBe("data:image/png;base64,iVBORw0KGgoA....5CYII=");
            }).then(done, done);
            expect(twofaMock.generateGoogleQRAsync).toHaveBeenCalledWith("OpenToken IO", "", "secretKey");
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