"use strict";

module.exports = (genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body, done) => {
        var callbackName, result;

        if (req.query) {
            callbackName = req.query.callback || req.query.jsonp;
        }

        if (callbackName) {
            result = `;typeof ${callbackName}==="function"&&${callbackName}(`;
        } else {
            result = "";
        }

        if (body) {
            if (Buffer.isBuffer(body)) {
                result += JSON.stringify(body.toString("base64"));
            } else {
                result += JSON.stringify(body);
            }
        }

        if (callbackName) {
            if (!body) {
                result += "null";
            }

            result += ");";
        }

        return done(null, new Buffer(`${result}\n`, "binary"));
    });
};
