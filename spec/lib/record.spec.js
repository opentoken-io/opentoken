"use strict";

describe("record", () => {
    var bufferSerializerMock, config, encryptionMock, fsMock, otDateMock, record, zlibAsyncMock;

    beforeEach(() => {
        var promiseMock;

        otDateMock = require("../mock/ot-date-mock")();
        promiseMock = require("../mock/promise-mock")();
        bufferSerializerMock = jasmine.createSpyObj("bufferSerializerMock", [
            "fromBuffer",
            "toBuffer"
        ]);
        bufferSerializerMock.fromBuffer.and.returnValue("Original data");
        bufferSerializerMock.toBuffer.and.returnValue(Buffer.from("Serialized data", "binary"));
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
        encryptionMock.decryptAsync.and.callFake(() => {
            return promiseMock.resolve(Buffer.from("decrypted", "binary"));
        });
        encryptionMock.encryptAsync.and.callFake((buffer, key, hmac, cipher) => {
            return promiseMock.resolve(Buffer.from(`encrypted-${cipher}`, "binary"));
        });
        fsMock = jasmine.createSpyObj("fs", [
            "readFile"
        ]);
        fsMock.readFile.and.callFake((filename, encoding, done) => {
            done(null, Buffer.from("encryption key", "utf8"));
        });
        zlibAsyncMock = require("../mock/zlib-async-mock")();
        record = require("../../lib/record")(bufferSerializerMock, config, encryptionMock, promiseMock.promisifyAll(fsMock), otDateMock, promiseMock, zlibAsyncMock);
    });
    it("exposes known public methods", () => {
        expect(record.freezeAsync).toEqual(jasmine.any(Function));
        expect(record.thawAsync).toEqual(jasmine.any(Function));
    });
    it("sets up the encryption key", () => {
        expect(fsMock.readFile).toHaveBeenCalledWith("encryption key file", "binary", jasmine.any(Function));
    });
    it("freezes data", () => {
        var data, innerKey, promise;

        data = {
            date: new Date()
        };
        innerKey = Buffer.from("This is the inner key", "binary");
        promise = record.freezeAsync(data, innerKey);
        expect(promise.then).toEqual(jasmine.any(Function));

        return promise.then((result) => {
            var args;

            // Serialize
            expect(bufferSerializerMock.toBuffer).toHaveBeenCalledWith(data);

            // Compress
            args = zlibAsyncMock.deflateRawAsync.calls.mostRecent().args;
            expect(args[0]).toEqual(jasmine.any(Buffer));
            expect(args[0].toString("binary")).toEqual("Serialized data");
            expect(args.length).toBe(1);

            // Inner encryption
            args = encryptionMock.encryptAsync.calls.argsFor(0);
            expect(args[0]).toEqual(jasmine.any(Buffer));
            expect(args[0].toString("binary")).toEqual("compressed");
            expect(args[1]).toBe(innerKey);
            expect(args[2]).toBe("secondary-hmac");
            expect(args[3]).toBe("secondary-cipher");

            // Serialize again.  I do not check the value of the expiration
            // date because it was not passed and I didn't go through the
            // effort of setting it correctly in this test.
            args = bufferSerializerMock.toBuffer.calls.mostRecent().args;
            expect(args[0].data.toString("binary")).toEqual("encrypted-secondary-cipher");

            // Outer encryption
            args = encryptionMock.encryptAsync.calls.argsFor(1);
            expect(args[0]).toEqual(jasmine.any(Buffer));
            expect(args[0].toString("binary")).toEqual("Serialized data");
            expect(args[1].toString("binary")).toBe("encryption key");
            expect(args[2]).toBe("primary-hmac");
            expect(args[3]).toBe("primary-cipher");

            // Done
            expect(result.toString("binary")).toEqual("encrypted-primary-cipher");
        });
    });
    describe("freezing with metadata", () => {
        it("saves metadata outside the inner encryption", () => {
            return record.freezeAsync({}, "", {}, {
                meta: "data"
            }).then(() => {
                expect(bufferSerializerMock.toBuffer.calls.argsFor(1)[0].meta).toEqual({
                    meta: "data"
                });
            });
        });
    });
    describe("freezing with expires", () => {
        var expiresMax, expiresOption;

        beforeEach(() => {
            // Set the "now" date to be our spy
            expiresMax = otDateMock.now();
            otDateMock.now.and.returnValue(expiresMax);
            expiresOption = jasmine.createSpyObj("expiresOption", [
                "isBefore"
            ]);
        });
        it("uses the passed expire date if it is before the max", () => {
            expiresOption.isBefore.and.returnValue(true);

            return record.freezeAsync({}, "", {
                expires: expiresOption
            }).then(() => {
                expect(bufferSerializerMock.toBuffer.calls.argsFor(1)[0].expires).toBe(expiresOption);
            });
        });
        it("uses the max if the passed expire date is after the max", () => {
            expiresOption.isBefore.and.returnValue(false);

            return record.freezeAsync({}, "", {
                expires: expiresOption
            }).then(() => {
                expect(bufferSerializerMock.toBuffer.calls.argsFor(1)[0].expires).toBe(expiresMax);
            });
        });
        it("uses the max without an expiration passed", () => {
            return record.freezeAsync({}, "").then(() => {
                expect(bufferSerializerMock.toBuffer.calls.argsFor(1)[0].expires).toBe(expiresMax);
            });
        });
    });
    it("thaws data", () => {
        var data, innerKey, promise;

        data = {
            date: new Date()
        };
        innerKey = Buffer.from("This is the inner key", "binary");
        bufferSerializerMock.fromBuffer.and.returnValue({
            data: "deserialized data"
        });
        promise = record.thawAsync(data, innerKey);
        expect(promise.then).toEqual(jasmine.any(Function));

        return promise.then((result) => {
            var args;

            // Outer encryption
            args = encryptionMock.decryptAsync.calls.argsFor(0);
            expect(args[0]).toBe(data);
            expect(args[1].toString("binary")).toBe("encryption key");

            // Deserialize
            args = bufferSerializerMock.fromBuffer.calls.argsFor(0);
            expect(args[0].toString("binary")).toBe("decrypted");

            // Inner encryption
            args = encryptionMock.decryptAsync.calls.argsFor(1);
            expect(args[0].toString("binary")).toBe("deserialized data");

            // Compression
            args = zlibAsyncMock.inflateRawAsync.calls.mostRecent().args;
            expect(args[0].toString("binary")).toBe("decrypted");

            // Deserialize again
            args = bufferSerializerMock.fromBuffer.calls.mostRecent().args;
            expect(args[0].toString("binary")).toBe("decompressed");

            // Done
            expect(result).toEqual({
                data: "deserialized data"
            });
        });
    });
    describe("thawing with expires", () => {
        var expires;

        beforeEach(() => {
            expires = jasmine.createSpyObj("expires", [
                "isBefore"
            ]);
            bufferSerializerMock.fromBuffer.and.returnValue({
                data: "deserialized data",
                expires
            });
        });
        it("deserializes when expires is after today", () => {
            expires.isBefore.and.returnValue(false);

            return record.thawAsync({}, "").then((result) => {
                expect(result).toEqual({
                    data: "deserialized data",
                    expires
                });
            });
        });
        it("errors when expires is before today", () => {
            expires.isBefore.and.returnValue(true);

            return record.thawAsync({}, "").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Expired");
            });
        });
    });
});
