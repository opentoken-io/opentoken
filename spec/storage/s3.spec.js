"use strict";

describe("storage/s3", () => {
    var awsSdkMock, promiseMock, s3;

    beforeEach(() => {
        class S3Fake {
            constructor(params) {
                this.params = params;
                this.getObjectAsync = jasmine.createSpy("getObjectAsync");
                this.getObjectAsync.andCallFake(() => {
                    return promiseMock.resolve({
                        Body: new Buffer("this is a buffer", "binary")
                    });
                });
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
        promiseMock = require("../mock/promise-mock");
        awsSdkMock = {
            S3: S3Fake,
            config: {
                region: null
            }
        };
        s3 = require("../../lib/storage/s3")(awsSdkMock, {
            storage: {
                s3: {
                    bucket: "test-bucket",
                    region: "us-east-1"
                }
            }
        }, promiseMock);
    });
    describe(".configure()", () => {
        it("sets up the settings", () => {
            awsSdkMock.S3 = jasmine.createSpy("awsSdkMock.S3");
            expect(awsSdkMock.config.region).toBe("us-east-1");
            s3.transit();
            expect(awsSdkMock.S3).toHaveBeenCalledWith({
                params: {
                    Bucket: "test-bucket"
                }
            });


            // Calling transit again to make sure we didn't call S3 again.
            s3.transit();
            expect(awsSdkMock.S3.calls.length).toBe(1);
        });
    });
    describe(".delAsync()", (done) => {
        it("deletes a file", () => {
            s3.delAsync("afile").then((val) => {
                expect(val).toEqual({
                    Key: "afile"
                });
            }).then(done, done);
        });
    });
    describe(".getAsync()", () => {
        it("gets an object back", (done) => {
            s3.getAsync("afile").then((val) => {
                expect(val).toEqual(jasmine.any(Buffer));
            }).then(done, done);
        });
    });
    describe(".listAsync()", () => {
        it("gets top level list", (done) => {
            s3.listAsync().then((val) => {
                expect(val).toEqual({
                    Prefix: null
                });
            }).then(done, done);
        });
        it("get list by passing in a prefix", (done) => {
            s3.listAsync("accounts").then((val) => {
                expect(val).toEqual({
                    Prefix: "accounts"
                });
            }).then(done, done);
        });
    });
    describe(".putAsync()", () => {
        it("puts to s3 with content as a string", (done) => {
            s3.putAsync("string", "this is a string").then((val) => {
                expect(val).toEqual({
                    Body: jasmine.any(Buffer),
                    ContentType: "application/octet-stream",
                    Key: "string",
                    ServerSideEncryption: "AES256"
                });
            }).then(done, done);
        });
        it("puts to s3 with contents as a buffer", (done) => {
            s3.putAsync("buffer", new Buffer("this is a buffer", "binary")).then((val) => {
                expect(val).toEqual({
                    Body: jasmine.any(Buffer),
                    ContentType: "application/octet-stream",
                    Key: "buffer",
                    ServerSideEncryption: "AES256"
                });
            }).then(done, done);
        });
        it("puts to s3 with options", (done) => {
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
        it("puts to s3 with content type option", (done) => {
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
        it("puts to s3 with expires option", (done) => {
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
