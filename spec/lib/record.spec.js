"use strict";

describe("record", () => {
    var bufferSerializerMock, config, encryptionMock, fsMock, otDateMock, record, zlibMock;

    beforeEach(() => {
        var promiseMock;

        otDateMock = require("../mock/ot-date-mock");
        promiseMock = require("../mock/promise-mock");
        bufferSerializerMock = jasmine.createSpyObj("bufferSerializerMock", [
            "fromBuffer",
            "toBuffer"
        ]);
        bufferSerializerMock.fromBuffer.andReturn("Original data");
        bufferSerializerMock.toBuffer.andReturn(new Buffer("Serialized data", "binary"));
        config = {
            encryption: {
                primary: {
                    cipher: "primary-cipher",
                    hmac: "primary-hmac"
                },
                secondary: {
                    cipher: "secondary-cipher",
                    hmac: "secondary-hmac"
                }
            },
            record: {
                encryptionKeyFile: "encryption key file",
                expirationMaximum: {
                    months: 6
                }
            }
        };
        encryptionMock = jasmine.createSpyObj("encryption", [
            "decryptAsync",
            "encryptAsync"
        ]);
        encryptionMock.decryptAsync.andCallFake(() => {
            return promiseMock.resolve(new Buffer("decrypted", "binary"));
        });
        encryptionMock.encryptAsync.andCallFake((buffer, key, hmac, cipher) => {
            return promiseMock.resolve(new Buffer("encrypted-" + cipher, "binary"));
        });
        fsMock = jasmine.createSpyObj("fs", [
            "readFile"
        ]);
        fsMock.readFile.andCallFake((filename, encoding, done) => {
            done(null, new Buffer("encryption key"));
        });
        zlibMock = jasmine.createSpyObj("zlib", [
            "deflateRaw",
            "inflateRaw"
        ]);
        zlibMock.deflateRaw.andCallFake((data, callback) => {
            callback(null, new Buffer("compressed", "binary"));
        });
        zlibMock.inflateRaw.andCallFake((data, callback) => {
            callback(null, new Buffer("decompressed", "binary"));
        });
        record = require("../../lib/record")(bufferSerializerMock, config, encryptionMock, fsMock, otDateMock, promiseMock, zlibMock);
    });
    it("exposes known public methods", () => {
        expect(record.freezeAsync).toEqual(jasmine.any(Function));
        expect(record.thawAsync).toEqual(jasmine.any(Function));
    });
    it("sets up the encryption key", () => {
        expect(fsMock.readFile).toHaveBeenCalledWith("encryption key file", "binary", jasmine.any(Function));
    });
    it("freezes data", (done) => {
        var data, innerKey, promise;

        data = {
            date: new Date()
        };
        innerKey = new Buffer("This is the inner key", "binary");
        promise = record.freezeAsync(data, innerKey);
        expect(promise.then).toEqual(jasmine.any(Function));
        promise.then((result) => {
            var args;

            // Serialize
            expect(bufferSerializerMock.toBuffer).toHaveBeenCalledWith(data);

            // Compress
            args = zlibMock.deflateRaw.mostRecentCall.args;
            expect(args[0]).toEqual(jasmine.any(Buffer));
            expect(args[0].toString("binary")).toEqual("Serialized data");
            expect(args[1]).toEqual(jasmine.any(Function));

            // Inner encryption
            args = encryptionMock.encryptAsync.calls[0].args;
            expect(args[0]).toEqual(jasmine.any(Buffer));
            expect(args[0].toString("binary")).toEqual("compressed");
            expect(args[1]).toBe(innerKey);
            expect(args[2]).toBe("secondary-hmac");
            expect(args[3]).toBe("secondary-cipher");

            // Serialize again.  I do not check the value of the expiration
            // date because it was not passed and I didn't go through the
            // effort of setting it correctly in this test.
            args = bufferSerializerMock.toBuffer.mostRecentCall.args;
            expect(args[0].data.toString("binary")).toEqual("encrypted-secondary-cipher");

            // Outer encryption
            args = encryptionMock.encryptAsync.calls[1].args;
            expect(args[0]).toEqual(jasmine.any(Buffer));
            expect(args[0].toString("binary")).toEqual("Serialized data");
            expect(args[1].toString("binary")).toBe("encryption key");
            expect(args[2]).toBe("primary-hmac");
            expect(args[3]).toBe("primary-cipher");

            // Done
            expect(result.toString("binary")).toEqual("encrypted-primary-cipher");
        }).then(done, done);
    });
    describe("freezing with expires", () => {
        var expiresMax, expiresOption;

        beforeEach(() => {
            // Set the "now" date to be our spy
            expiresMax = otDateMock.now();
            otDateMock.now.andReturn(expiresMax);
            expiresOption = jasmine.createSpyObj("expiresOption", [
                "isBefore"
            ]);
        });
        it("uses the passed expire date if it is before the max", (done) => {
            expiresOption.isBefore.andReturn(true);
            record.freezeAsync({}, "", {
                expires: expiresOption
            }).then(() => {
                expect(bufferSerializerMock.toBuffer.calls[1].args[0].expires).toBe(expiresOption);
            }).then(done, done);
        });
        it("uses the max if the passed expire date is after the max", (done) => {
            expiresOption.isBefore.andReturn(false);
            record.freezeAsync({}, "", {
                expires: expiresOption
            }).then(() => {
                expect(bufferSerializerMock.toBuffer.calls[1].args[0].expires).toBe(expiresMax);
            }).then(done, done);
        });
        it("uses the max without an expiration passed", (done) => {
            record.freezeAsync({}, "").then(() => {
                expect(bufferSerializerMock.toBuffer.calls[1].args[0].expires).toBe(expiresMax);
            }).then(done, done);
        });
    });
    it("thaws data", (done) => {
        var data, innerKey, promise;

        data = {
            date: new Date()
        };
        innerKey = new Buffer("This is the inner key", "binary");
        bufferSerializerMock.fromBuffer.andReturn({
            data: "deserialized data"
        });
        promise = record.thawAsync(data, innerKey);
        expect(promise.then).toEqual(jasmine.any(Function));
        promise.then((result) => {
            var args;

            // Outer encryption
            args = encryptionMock.decryptAsync.calls[0].args;
            expect(args[0]).toBe(data);
            expect(args[1].toString("binary")).toBe("encryption key");

            // Deserialize
            args = bufferSerializerMock.fromBuffer.calls[0].args;
            expect(args[0].toString("binary")).toBe("decrypted");

            // Inner encryption
            args = encryptionMock.decryptAsync.calls[1].args;
            expect(args[0].toString("binary")).toBe("deserialized data");

            // Compression
            args = zlibMock.inflateRaw.mostRecentCall.args
            expect(args[0].toString("binary")).toBe("decrypted");

            // Deserialize again
            args = bufferSerializerMock.fromBuffer.mostRecentCall.args;
            expect(args[0].toString("binary")).toBe("decompressed");

            // Done
            expect(result).toEqual({
                data: "deserialized data"
            });
        }).then(done, done);
    });
    describe("thawing with expires", () => {
        var expires;

        beforeEach(() => {
            expires = jasmine.createSpyObj("expires", [
                "isBefore"
            ]);
            bufferSerializerMock.fromBuffer.andReturn({
                data: "deserialized data",
                expires: expires
            });
        });
        it("deserializes when expires is after today", (done) => {
            expires.isBefore.andReturn(false);
            record.thawAsync({}, "").then((result) => {
                expect(result).toEqual({
                    data: "deserialized data",
                    expires: expires
                });
            }).then(done, done);
        });
        it("errors when expires is before today", (done) => {
            expires.isBefore.andReturn(true);
            record.thawAsync({}, "").then(() => {
                done("Should have not been successful");
            }, () => {
                done();
            });
        });
    });
});
