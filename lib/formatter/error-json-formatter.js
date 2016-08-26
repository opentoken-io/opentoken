"use strict";

module.exports = (errorResponse, genericFormatter) => {
    // The default function here should not be called because this content
    // type should be handled by genericFormatter.  So, if execution does
    // come to this function then I don't know what `body` really is.
    return genericFormatter.formatWithFallback((req, res, body, done) => {
        errorResponse.createAsync("Unknown error", "4qsTYJa3").then((errorObject) => {
            var content;

            content = JSON.stringify(errorObject);
            done(null, new Buffer(`${content}\n`, "binary"));
        });
    });
};
