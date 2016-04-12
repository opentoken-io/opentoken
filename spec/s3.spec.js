"use strict";

describe("storage/s3", () => {
    var AwsSdkMock, promiseMock, s3;
    
    /**
     * Checks the result for the promise object passed in.
     *
     * @param {Object} results
     * @param {boolean} successful
     * @param {string} message
     */
    function checkPromiseResults(results, successful, message) {
        expect(results.success).toBe(successful);
        expect(results.value).toEqual(message);
    }
    
    beforeEach(() => {
        var s3File;
        
        s3File = require("../lib/storage/s3");
        promiseMock = require("./mock/promise-mock");
        class S3Fake {
            constructor(params) {
                this.params = params;
                this.deleteObjectAsync = jasmine.createSpy("deleteObjectAsync");
                this.getObjectAsync = jasmine.createSpy("getObjectAsync");
                this.listObjectsAsync = jasmine.createSpy("listObjectsAsync");
                this.putObjectAsync = jasmine.createSpy("putObjectAsync");
            }
        }
        AwsSdkMock = {
            "S3": S3Fake,
            "config": {
                "region": null
            }
        };
        s3 = new s3File(AwsSdkMock, promiseMock);
    });
    describe("configure", () => {
        beforeEach(() => {
            AwsSdkMock.S3 = jasmine.createSpy("s3Mock");
        });
        it("passes in configuration options for all", () => {
            s3.transit();
            expect(s3.aws.config.region).toBe("us-east-1");
            expect(AwsSdkMock.S3).toHaveBeenCalledWith({params: {
                Bucket: null
            }});
        });
        it("passes in configuration options for all", () => {
            s3.configure({
                region: "us-west-1",
                bucket: "test-bucket"
            });
            s3.transit();
            expect(s3.aws.config.region).toBe("us-west-1");
            expect(AwsSdkMock.S3).toHaveBeenCalledWith({params: {
                Bucket: "test-bucket"
            }});
        });
    });
    describe("fileDel", () => {
        var transit;
        
        beforeEach(() => {
            transit = s3.transit();
            transit.deleteObjectAsync.andCallFake((params) => {
                if (params.Key == "afile") {
                    return promiseMock.resolve("deleted file");
                }

                return promiseMock.reject("error deleting file");
            });
        });
        it("deletes a file", () => {
            checkPromiseResults(s3.fileDel("afile"), true, "deleted file");
        });
    });
    describe("fileGet", () => {
        var transit;
        
        beforeEach(() => {
            transit = s3.transit();
            transit.getObjectAsync.andCallFake((params) => {
                if (params.Key == "afile") {
                    return promiseMock.resolve("got data");
                }

                return promiseMock.reject("error fetching file");
            });
        });
        it("gets an object back", () => {
            checkPromiseResults(s3.fileGet("afile"), true, "got data");
        });
    });
    describe("fileList", () => {
        var transit;

        beforeEach(() => {
            transit = s3.transit();
            transit.listObjectsAsync.andCallFake((params) => {
                if (! params.Prefix) {
                    return promiseMock.resolve("got list from top level");
                }
                
                if (params.Prefix && params.Prefix === "accounts") {
                    return promiseMock.resolve("got list from accounts");
                } else {
                    return promiseMock.reject("error fetching list");
                }
            });
        });
        it("gets top level list", () => {
            checkPromiseResults(s3.fileList(), true, "got list from top level");
        });
        it("passes in a prefix", () => {
            checkPromiseResults(s3.fileList("accounts"), true, "got list from accounts");
        });
    });
    describe("filePut", () => {
        var transit, expectedOptions;

        beforeEach(() => {
            transit = s3.transit();
            transit.putObjectAsync.andCallFake((params) => {

                if (params.Key) {
                    expect(params.Body).toEqual(jasmine.any(Buffer));
                    expect(params.ServerSideEncryption).toBe("AES256");
                    
                    if (params.Key === "options") {
                        expect(params.ContentType).toBe(expectedOptions.contentType);
                        expect(params.Expires).toBe(expectedOptions.expires);
                        return promiseMock.resolve("puts file");
                    }
                    
                    return promiseMock.resolve("puts file");
                }
            });
        });
        it("passes in contents as a string", () => {
            var putReturn;
            
            putReturn = s3.filePut("string", "this is a string");
            checkPromiseResults(putReturn, true, "puts file");
        });
        it("passes in contents as a buffer", () => {
            var putReturn;
            
            putReturn = s3.filePut("string", new Buffer("this is a buffer", "binary"));
            checkPromiseResults(putReturn, true, "puts file");
        });
        it("passes in options", () => {
            var putReturn;

            expectedOptions = {
                expires: "a date",
                contentType: "text/plain"
            }
            putReturn = s3.filePut("options", "file contents", {
                contentType: "text/plain",
                expires: "a date"
            });
            checkPromiseResults(putReturn, true, "puts file");
        });
        it("passes in content type option", () => {
            var putReturn;

            expectedOptions = {
                expires: null,
                contentType: "text/plain"
            }
            putReturn = s3.filePut("options", "file contents", {
                contentType: "text/plain"
            });
            checkPromiseResults(putReturn, true, "puts file");
        });
        it("passes in expires option", () => {
            var putReturn;

            expectedOptions = {
                expires: "a date",
                contentType: "application/octet-stream"
            }
            putReturn = s3.filePut("options", "file contents", {
                expires: "a date"
            });
            checkPromiseResults(putReturn, true, "puts file");
        });
    });
});