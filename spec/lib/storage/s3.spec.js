"use strict";

describe("storage/s3", () => {
    var awsSdkMock, config, create, promiseMock;

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
                awsSdkMock.lastInstance = this;
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
            S3: S3Fake
        };
        config = {
            storage: {
                s3: {
                    accessKeyId: "akey",
                    bucket: "test-bucket",
                    region: "us-east-1",
                    secretAccessKey: "skey"
                }
            }
        };
        create = () => {
            return require("../../../lib/storage/s3")(awsSdkMock, config, promiseMock);
        };
    });
    describe("initial configuration", () => {
        it("deletes empty AWS credentials", () => {
            config.storage.s3.accessKeyId = "";
            config.storage.s3.secretAccessKey = "";

            // Must make a call to have the transit() function called
            create().deleteAsync("anything");
            expect(awsSdkMock.lastInstance.params).toEqual({
                params: {
                    Bucket: "test-bucket",
                    ContentType: "application/octet-stream",
                    ServerSideEncryption: "AES256"
                },
                region: "us-east-1"
            });
        });
        it("sets up the S3 object", () => {
            // Must make a call to have the transit() function called
            create().deleteAsync("anything");
            expect(awsSdkMock.lastInstance.params).toEqual({
                accessKeyId: "akey",
                params: {
                    Bucket: "test-bucket",
                    ContentType: "application/octet-stream",
                    ServerSideEncryption: "AES256"
                },
                region: "us-east-1",
                secretAccessKey: "skey"
            });
        });
    });
    describe("on an instance", () => {
        var s3;

        beforeEach(() => {
            s3 = create();
        });
        describe(".deleteAsync()", () => {
            it("deletes a file", () => {
                return s3.deleteAsync("afile").then((val) => {
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
        describe(".putAsync()", () => {
            it("puts to s3 with content as a string", () => {
                return s3.putAsync("string", "this is a string").then((val) => {
                    expect(val).toEqual({
                        Body: jasmine.any(Buffer),
                        Key: "string"
                    });
                });
            });
            it("puts to s3 with contents as a buffer", () => {
                return s3.putAsync("buffer", new Buffer("this is a buffer", "binary")).then((val) => {
                    expect(val).toEqual({
                        Body: jasmine.any(Buffer),
                        Key: "buffer"
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
                        Key: "options"
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
                        Key: "options"
                    });
                });
            });
            it("puts to s3 with expires option", () => {
                return s3.putAsync("options", "file contents", {
                    expires: "a date"
                }).then((val) => {
                    expect(val).toEqual({
                        Body: jasmine.any(Buffer),
                        Expires: "a date",
                        Key: "options"
                    });
                });
            });
        });
    });
});
