"use strict";

class HttpsConfig {
    constructor(fs, logger) {
        this.logger = logger;
        this.fs = fs;
    }


    /**
     * Gets the options to pass into the server
     *
     * @param {Object} config
     * @return {Object} options
     */
    getOptions(config) {
        var options;

        options = {
            key: this.fs.readFileSync(config.keyFile, "utf8"),
            cert: this.fs.readFileSync(config.certFile, "utf8")
        };

        return options;
    };
};

module.exports = HttpsConfig;