"use strict";

module.exports = (genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body, done) => {
        var string;

        if (Buffer.isBuffer(body)) {
            string = body.toString("base64");
        } else if (body) {
            string = JSON.stringify(body);
        } else {
            string = "null";
        }

        done(null, new Buffer(`${string}\n`, "binary"));
    });
};
