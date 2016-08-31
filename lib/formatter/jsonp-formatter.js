"use strict";

module.exports = (genericFormatter) => {
    return genericFormatter.formatWithFallback((req, res, body, done) => {
        var callbackName, content;

        if (req.query) {
            callbackName = req.query.callback || req.query.jsonp;
        }

        if (callbackName) {
            content = `;typeof ${callbackName}==="function"&&${callbackName}(`;
        } else {
            content = "";
        }

        if (body) {
            if (Buffer.isBuffer(body)) {
                content += JSON.stringify(body.toString("base64"));
            } else {
                content += JSON.stringify(body);
            }
        }

        if (callbackName) {
            if (!body) {
                content += "null";
            }

            content += ");";
        }

        return done(null, new Buffer(`${content}\n`, "binary"));
    });
};
