"use strict";

describe("middleware/readBodyBufferMiddleware", () => {
    var middlewareFactory;


    /**
     * Fake error class
     *
     * @param {string} message
     */
    function PayloadTooLargeError(message) {
        this.message = message;
    }


    beforeEach(() => {
        var restifyErrorsMock, zlib;

        zlib = require("zlib");
        restifyErrorsMock = {
            PayloadTooLargeError
        };
        middlewareFactory = require("../../../lib/middleware/read-body-buffer-middleware")(restifyErrorsMock, zlib);
    });
    it("makes middleware", () => {
        expect(middlewareFactory()).toEqual(jasmine.any(Function));
    });
    describe("middleware", () => {
        var middlewareAsync, req, res;

        beforeEach(() => {
            req = require("../../mock/request-mock")();
            res = require("../../mock/response-mock")();
            middlewareAsync = jasmine.middlewareToPromise(middlewareFactory(20));
        });
        it("appends multiple chunks together", () => {
            var promise;

            req.internalContentLength = 12;
            promise = middlewareAsync(req, res).then(() => {
                expect(Buffer.isBuffer(req.body)).toBe(true);
                expect(req.body.toString()).toEqual("chunk1chunk2");
            });
            expect(req.resume).toHaveBeenCalled();
            req.emit("data", new Buffer("chunk1", "binary"));
            req.emit("data", new Buffer("chunk2", "binary"));
            req.emit("end");

            return promise;
        });
        it("handles a chunked request", () => {
            var promise;

            // Does not set a content length
            req.isChunked.andReturn(true);
            promise = middlewareAsync(req, res).then(() => {
                expect(Buffer.isBuffer(req.body)).toBe(true);
                expect(req.body.toString()).toEqual("chunk1chunk2");
            });
            expect(req.resume).toHaveBeenCalled();
            req.emit("data", new Buffer("chunk1", "binary"));
            req.emit("data", new Buffer("chunk2", "binary"));
            req.emit("end");

            return promise;
        });
        it("decompresses gzipped data as separate chunks", () => {
            var promise;

            req.internalContentLength = 25;
            req.headers["content-encoding"] = "gzip";
            promise = middlewareAsync(req, res).then(() => {
                expect(Buffer.isBuffer(req.body)).toBe(true);
                expect(req.body.toString()).toEqual("hello");
            });
            expect(req.resume).toHaveBeenCalled();
            req.emit("data", new Buffer("1f8b0800000000000003", "hex"));
            req.emit("data", new Buffer("cb48cdc9c9070086a6103605000000", "hex"));
            req.emit("end");

            return promise;
        });
        it("decompresses gzipped data as separate chunks", () => {
            var promise;

            req.internalContentLength = 25;
            req.headers["content-encoding"] = "gzip";
            promise = middlewareAsync(req, res).then(() => {
                expect(Buffer.isBuffer(req.body)).toBe(true);
                expect(req.body.toString()).toEqual("hello");
            });
            expect(req.resume).toHaveBeenCalled();
            req.emit("data", new Buffer("1f8b0800000000000003", "hex"));
            req.emit("data", new Buffer("cb48cdc9c9070086a6103605000000", "hex"));
            req.emit("end");

            return promise;
        });
        it("handles empty bodies without events", () => {
            return middlewareAsync(req, res).then(() => {
                expect(Buffer.isBuffer(req.body)).toBe(true);
                expect(req.body.toString()).toEqual("");
            });
        });
        it("dies when receiving too much data all at once", () => {
            var promise;

            req.internalContentLength = 30;
            promise = middlewareAsync(req, res).then(() => {
                expect(Buffer.isBuffer(req.body)).toBe(true);
                expect(req.body.toString()).toEqual("chunk1chunk2");
            });
            req.emit("data", new Buffer("012345678901234567890123456789", "binary"));
            req.emit("end");

            return promise.then(jasmine.fail, (err) => {
                expect(err).toEqual(jasmine.any(PayloadTooLargeError));
            });
        });
        it("dies when receiving too much data in chunks", () => {
            var promise;

            req.internalContentLength = 30;
            promise = middlewareAsync(req, res).then(() => {
                expect(Buffer.isBuffer(req.body)).toBe(true);
                expect(req.body.toString()).toEqual("chunk1chunk2");
            });
            req.emit("data", new Buffer("0123456789", "binary"));
            req.emit("data", new Buffer("0123456789", "binary"));
            req.emit("data", new Buffer("0123456789", "binary"));
            req.emit("end");

            return promise.then(jasmine.fail, (err) => {
                expect(err).toEqual(jasmine.any(PayloadTooLargeError));
            });
        });
    });
});
