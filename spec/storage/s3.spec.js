"use strict";

describe("storage/s3", () => {
    var awsSdkMock, promiseMock, s3;

    beforeEach(() => {
        var s3File;

        s3File = require("../../lib/storage/s3");
        promiseMock = require("../mock/promise-mock");
        class S3Fake {
            constructor(params) {
                this.params = params;
                this.getObjectAsync = jasmine.createSpy("getObjectAsync");
                [
                    "deleteObjectAsync",
                    "listObjectsAsync",
                    "putObjectAsync"
                ].forEach((method) => {
                    this[method] = jasmine.createSpy(method);
                    this[method].andCallFake((params) => {
                        return promiseMock.resolve(params);
                    });
                });
            }
        }
        awsSdkMock = {
            S3: S3Fake,
            config: {
                region: null
            }
        };
        s3 = new s3File(awsSdkMock, promiseMock);
    });
    describe("configure()", () => {
        beforeEach(() => {
            awsSdkMock.S3 = jasmine.createSpy("s3Mock");
        });
        it("passes in configuration options for all", () => {
            expect(s3.aws.config.region).toBe("us-east-1");
            s3.transit();
            expect(awsSdkMock.S3).toHaveBeenCalledWith({
                params: {
                    Bucket: null
                }
            });
        });
        it("passes in configuration options for all", () => {
            s3.configure({
                region: "us-west-1",
                bucket: "test-bucket"
            });
            expect(s3.aws.config.region).toBe("us-west-1");
            s3.transit();
            expect(awsSdkMock.S3).toHaveBeenCalledWith({
                params: {
                    Bucket: "test-bucket"
                }
            });
        });
    });
    describe("del()", () => {
        it("deletes a file", () => {
            expect(s3.del("afile").status()).toEqual({
                success: true,
                value: {
                    Key: "afile"
                }
            });
        });
    });
    describe("get()", () => {
        beforeEach(() => {
            var transit;

            transit = s3.transit();
            transit.getObjectAsync.andCallFake((params) => {
                return promiseMock.resolve({
                    Body: new Buffer("this is a buffer", "binary")
                });
            });
        });
        it("gets an object back", () => {
            expect(s3.get("afile").status()).toEqual({
                success: true,
                value: jasmine.any(Buffer)
            });
        });
    });
    describe("list()", () => {
        it("gets top level list", () => {
            expect(s3.list().status()).toEqual({
                success: true,
                value: {
                    Prefix: null
                }
            });
        });
        it("passes in a prefix", () => {
            expect(s3.list("accounts").status()).toEqual({
                success: true,
                value: {
                    Prefix: "accounts"
                }
            });
        });
    });
    describe("put()", () => {
        it("passes in contents as a string", () => {
            expect(s3.put("string", "this is a string").status()).toEqual({
                success: true,
                value: {
                    Body: jasmine.any(Buffer),
                    ContentType: "application/octet-stream",
                    Key: "string",
                    ServerSideEncryption: "AES256"
                }
            });
        });
        it("passes in contents as a buffer", () => {
            expect(s3.put("buffer", new Buffer("this is a buffer", "binary")).status()).toEqual({
                success: true,
                value: {
                    Body: jasmine.any(Buffer),
                    ContentType: "application/octet-stream",
                    Key: "buffer",
                    ServerSideEncryption: "AES256"
                }
            });
        });
        it("passes in options", () => {
            expect(s3.put("options", "file contents", {
                contentType: "text/plain",
                expires: "a date"
            }).status()).toEqual({
                success: true,
                value: {
                    Body: jasmine.any(Buffer),
                    ContentType: "text/plain",
                    Expires: "a date",
                    Key: "options",
                    ServerSideEncryption: "AES256"
                }
            });
        });
        it("passes in content type option", () => {
            expect(s3.put("options", "file contents", {
                contentType: "text/plain"
            }).status()).toEqual({
                success: true,
                value: {
                    Body: jasmine.any(Buffer),
                    ContentType: "text/plain",
                    Expires: null,
                    Key: "options",
                    ServerSideEncryption: "AES256"
                }
            });
        });
        it("passes in expires option", () => {
            expect(s3.put("options", "file contents", {
                expires: "a date"
            }).status()).toEqual({
                success: true,
                value: {
                    Body: jasmine.any(Buffer),
                    ContentType: "application/octet-stream",
                    Expires: "a date",
                    Key: "options",
                    ServerSideEncryption: "AES256"
                }
            });
        });
    });
});