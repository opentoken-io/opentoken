"use strict";

describe("storage/s3", () => {
    var awsSdkMock, promiseMock, s3;

    beforeEach(() => {
        var s3File;

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

        s3File = require("../../lib/storage/s3");
        promiseMock = require("../mock/promise-mock");
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
    describe("del()", (done) => {
        it("deletes a file", () => {
            s3.delAsync("afile").then((val) => {
                expect(val).toEqual({
                    Key: "afile"
                });
            }).then(done, done);
        });
    });
    describe("get()", () => {
        beforeEach(() => {
            var transit;

            transit = s3.transit();
            transit.getObjectAsync.andCallFake(() => {
                return promiseMock.resolve({
                    Body: new Buffer("this is a buffer", "binary")
                });
            });
        });
        it("gets an object back", (done) => {
            s3.getAsync("afile").then((val) => {
                expect(val).toEqual(jasmine.any(Buffer));
            }).then(done, done);
        });
    });
    describe("list()", () => {
        it("gets top level list", (done) => {
            s3.listAsync().then((val) => {
                expect(val).toEqual({
                    Prefix: null
                });
            }).then(done, done);
        });
        it("passes in a prefix", (done) => {
            s3.listAsync("accounts").then((val) => {
                expect(val).toEqual({
                    Prefix: "accounts"
                });
            }).then(done, done);
        });
    });
    describe("put()", () => {
        it("passes in contents as a string", (done) => {
            s3.putAsync("string", "this is a string").then((val) => {
                expect(val).toEqual({
                    Body: jasmine.any(Buffer),
                    ContentType: "application/octet-stream",
                    Key: "string",
                    ServerSideEncryption: "AES256"
                });
            }).then(done, done);
        });
        it("passes in contents as a buffer", (done) => {
            s3.putAsync("buffer", new Buffer("this is a buffer", "binary")).then((val) => {
                expect(val).toEqual({
                    Body: jasmine.any(Buffer),
                    ContentType: "application/octet-stream",
                    Key: "buffer",
                    ServerSideEncryption: "AES256"
                });
            }).then(done, done);
        });
        it("passes in options", (done) => {
            s3.putAsync("options", "file contents", {
                contentType: "text/plain",
                expires: "a date"
            }).then((val) => {
                expect(val).toEqual({
                    Body: jasmine.any(Buffer),
                    ContentType: "text/plain",
                    Expires: "a date",
                    Key: "options",
                    ServerSideEncryption: "AES256"
                });
            }).then(done, done);
        });
        it("passes in content type option", (done) => {
            s3.putAsync("options", "file contents", {
                contentType: "text/plain"
            }).then((val) => {
                expect(val).toEqual({
                    Body: jasmine.any(Buffer),
                    ContentType: "text/plain",
                    Expires: null,
                    Key: "options",
                    ServerSideEncryption: "AES256"
                });
            }).then(done, done);
        });
        it("passes in expires option", (done) => {
            s3.putAsync("options", "file contents", {
                expires: "a date"
            }).then((val) => {
                expect(val).toEqual({
                    Body: jasmine.any(Buffer),
                    ContentType: "application/octet-stream",
                    Expires: "a date",
                    Key: "options",
                    ServerSideEncryption: "AES256"
                });
            }).then(done, done);
        });
    });
});
