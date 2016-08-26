"use strict";

module.exports = (genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body, done) => {
        var content;

        content = "";

        if (body) {
            content = body.toString();
        }

        return done(null, new Buffer(`${content}\n`, "binary"));
    });
};
