"use strict";

describe("TwoFactorAutenticator", () => {
    var hotp, tfaMock, promiseMock;

    beforeEach(() => {
        var HOTP;

        HOTP = require("../../lib/mfa/hotp");
        promiseMock = require("../mock/promise-mock");
        tfaMock = jasmine.createSpyObj("tfaMock", [
            "generateKeyAsync",
            "generateGoogleQRAsync",
            "verifyTOTP"
        ]);
        [
            "generateKeyAsync",
            "generateGoogleQRAsync",
            "verifyTOTP"
        ].forEach((method) => {
            tfaMock[method] = jasmine.createSpy("tfaMock" + method);
        });
        tfaMock.generateKeyAsync.andCallFake(() => {
            return promiseMock.resolve(
                "thisIsAReallyLongKeyForMFA"
            );
        });
        tfaMock.generateGoogleQRAsync.andCallFake(() => {
            return promiseMock.resolve(
                "data:image/png;base64,iVBORw0KGgoA....5CYII="
            );
        });
        hotp = new HOTP(tfaMock, promiseMock);
    });
    describe(".generateSecretAsync()", () => {
        it("returns a key at the proper length", (done) => {
            hotp.generateSecretAsync().then((result) => {
                expect(result).toBe("thisIsAReallyLongKeyForMFA");
            }).then(done, done);
            expect(tfaMock.generateKeyAsync).toHaveBeenCalledWith(128);
        });
    });
    describe(".generateQRCodeAsync()", () => {
        it("returns data for a qr code", (done) => {
            hotp.generateQrCodeAsync("secretKey", "some.one@example.net").then((result) => {
                expect(result).toBe("data:image/png;base64,iVBORw0KGgoA....5CYII=");
            }).then(done, done);
            expect(tfaMock.generateGoogleQRAsync).toHaveBeenCalledWith("OpenToken IO", "some.one@example.net", "secretKey");
        });
        it("returns data for a qr code without qr code", (done) => {
            hotp.generateQrCodeAsync("secretKey").then((result) => {
                expect(result).toBe("data:image/png;base64,iVBORw0KGgoA....5CYII=");
            }).then(done, done);
            expect(tfaMock.generateGoogleQRAsync).toHaveBeenCalledWith("OpenToken IO", "", "secretKey");
        });
    });
    describe(".verifyToken()", () => {
        it("returns true from a valid check", () => {
            tfaMock.verifyTOTP.andReturn(true);
            expect(hotp.verifyToken("secretKey", "054643")).toBe(true);
            expect(tfaMock.verifyTOTP.mostRecentCall.args[2]).toEqual({
                afterDrift: 0,
                beforeDrift: 0,
                step: 30
            });
        });
        it("returns false from a invalid check", () => {
            tfaMock.verifyTOTP.andReturn(false);
            expect(hotp.verifyToken("secretKey", "054643")).toBe(false);
        });
        it("passes in options for previous", () => {
            var options;

            tfaMock.verifyTOTP.andReturn(true);
            options = {
                afterDrift: 1,
                beforeDrift: 1
            };
            expect(hotp.verifyToken("secretKey", "054643", options)).toBe(true);
            expect(tfaMock.verifyTOTP.mostRecentCall.args[2]).toEqual({
                afterDrift: 1,
                beforeDrift: 1,
                step: 30
            });
        });
    });
});