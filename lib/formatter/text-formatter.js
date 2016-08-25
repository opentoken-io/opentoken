"use strict";

module.exports = (genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body, done) => {
        var result;

        result = "";

        if (body) {
            result = body.toString();
        }

        return done(null, new Buffer(`${result}\n`, "binary"));
    });
};
