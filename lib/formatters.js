"use strict";

module.exports = (binaryFormatter, errorJsonFormatter, imagePngFormatter, jsonFormatter, jsonpFormatter, textFormatter) => {
    return {
        "application/javascript; q=0.2": jsonpFormatter,
        "application/json; q=0.5": jsonFormatter,
        "application/octet-stream; q=0.3": binaryFormatter,
        "application/vnd.error+json; q=0.1": errorJsonFormatter,
        "image/png; q=0.1": imagePngFormatter,
        "text/plain; q=0.4": textFormatter
    };
};
