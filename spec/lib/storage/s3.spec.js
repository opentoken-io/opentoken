"use strict";

describe("storage/s3", () => {
    var awsSdkMock, promiseMock, s3;

    beforeEach(() => {
        /**
         * Fake S3 class
         */
        class S3Fake {
            /**
             * Set up spies on the methods
             *
             * @param {*} params No influence on this class
             */
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
                    this[method].andCallFake((paramsInside) => {
                        return promiseMock.resolve(paramsInside);
                    });
                });
            }
        }
        promiseMock = require("../../mock/promise-mock")();
        awsSdkMock = {
            S3: S3Fake,
            config: {
                region: null
            }
        };
        s3 = require("../../../lib/storage/s3")(awsSdkMock, {
            storage: {
                s3: {
                    bucket: "test-bucket",
                    region: "us-east-1"
                }
            }
        }, promiseMock);
    });
    describe(".configure()", () => {
        it("sets up the S3 object", () => {
            awsSdkMock.S3 = jasmine.createSpy("awsSdkMock.S3");
            expect(awsSdkMock.config.region).toBe("us-east-1");
            s3.transit();
            expect(awsSdkMock.S3).toHaveBeenCalledWith({
                params: {
                    Bucket: "test-bucket"
                }
            });
        });
    });
    describe(".transit()", () => {
        it("should only make (call) the S3 object once", () => {
            awsSdkMock.S3 = jasmine.createSpy("awsSdkMock.S3");
            s3.transit();
            s3.transit();
            expect(awsSdkMock.S3.calls.length).toBe(1);
        });
    });
    describe(".delAsync()", () => {
        it("deletes a file", () => {
            return s3.delAsync("afile").then((val) => {
                expect(val).toEqual({
                    Key: "afile"
                });
            });
        });
    });
    describe(".getAsync()", () => {
        it("gets an object back", () => {
            return s3.getAsync("afile").then((val) => {
                expect(val).toEqual(jasmine.any(Buffer));
            });
        });
    });
    describe(".listAsync()", () => {
        it("gets top level list", () => {
            return s3.listAsync().then((val) => {
                expect(val).toEqual({
                    Prefix: null
                });
            });
        });
        it("gets a list by passing in a prefix", () => {
            return s3.listAsync("accounts").then((val) => {
                expect(val).toEqual({
                    Prefix: "accounts"
                });
            });
        });
    });
    describe(".putAsync()", () => {
        it("puts to s3 with content as a string", () => {
            return s3.putAsync("string", "this is a string").then((val) => {
                expect(val).toEqual({
                    Body: jasmine.any(Buffer),
                    ContentType: "application/octet-stream",
                    Key: "string",
                    ServerSideEncryption: "AES256"
                });
            });
        });
        it("puts to s3 with contents as a buffer", () => {
            return s3.putAsync("buffer", new Buffer("this is a buffer", "binary")).then((val) => {
                expect(val).toEqual({
                    Body: jasmine.any(Buffer),
                    ContentType: "application/octet-stream",
                    Key: "buffer",
                    ServerSideEncryption: "AES256"
                });
            });
        });
        it("puts to s3 with options", () => {
            return s3.putAsync("options", "file contents", {
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
            });
        });
        it("puts to s3 with content type option", () => {
            return s3.putAsync("options", "file contents", {
                contentType: "text/plain"
            }).then((val) => {
                expect(val).toEqual({
                    Body: jasmine.any(Buffer),
                    ContentType: "text/plain",
                    Expires: null,
                    Key: "options",
                    ServerSideEncryption: "AES256"
                });
            });
        });
        it("puts to s3 with expires option", () => {
            return s3.putAsync("options", "file contents", {
                expires: "a date"
            }).then((val) => {
                expect(val).toEqual({
                    Body: jasmine.any(Buffer),
                    ContentType: "application/octet-stream",
                    Expires: "a date",
                    Key: "options",
                    ServerSideEncryption: "AES256"
                });
            });
        });
    });
});
