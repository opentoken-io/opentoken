/**
 * Reads an entire request body and attaches it to the request object
 * as a big Buffer.
 *
 * Greatly inspired by the Restify plugin bodyReader, but this reads the
 * body regardless of the headers.
 */
"use strict";

module.exports = (zlib) => {
    // To match other middleware, this exports a factory (for injection)
    // and the result of the factory is a generator (for further
    // injection by a route) that provides the middleware.
    return () => {
        return (req, res, next) => {
            var buffers;

            /**
             * Append a chunk to the decompressed body.
             *
             * @param {Buffer} chunk
             */
            function bodyAppend(chunk) {
                buffers.push(chunk);
            }


            /**
             * Indicate completion of the stream of data that needs to be
             * collected into `req.body`.  Converts the array into a single
             * large Buffer.  Indicates completion of the middleware.
             */
            function done() {
                req.body = Buffer.concat(buffers);
                next();
            }


            /**
             * When the request is gzipped, handle the decompression of the
             * body and pass off to the normal bodyAppend routine.
             */
            function gzippedBody() {
                var gz;

                gz = zlib.createGunzip();
                gz.on("data", bodyAppend);
                gz.once("end", done);
                req.on("data", (chunk) => {
                    gz.write(chunk);
                });
                req.once("end", () => {
                    gz.end();
                });
            }


            /**
             * When dealing with a normal body we don't have a lot of tasks
             * to perform.  Hook up basic events.
             */
            function normalBody() {
                req.on("data", bodyAppend);
                req.on("end", done);
            }

            if (req.getContentLength() === 0 && !req.isChunked()) {
                req.body = new Buffer("", "binary");
                next();

                return;
            }

            buffers = [];

            if (req.headers["content-encoding"] === "gzip") {
                gzippedBody();
            } else {
                normalBody();
            }

            req.once("error", next);
            req.resume();
        };
    };
};
