"use strict";

describe("middleware/readBodyBufferMiddleware", () => {
    var middlewareFactory;

    beforeEach(() => {
        var zlib;

        zlib = require("zlib");
        middlewareFactory = require("../../../lib/middleware/read-body-buffer-middleware")(zlib);
    });
    it("makes middleware", () => {
        expect(middlewareFactory()).toEqual(jasmine.any(Function));
    });
    describe("middleware", () => {
        var middlewareAsync, req, res;

        beforeEach(() => {
            req = require("../../mock/request-mock")();
            res = require("../../mock/response-mock")();
            middlewareAsync = jasmine.middlewareToPromise(middlewareFactory());
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
    });
});
