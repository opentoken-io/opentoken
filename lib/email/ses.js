"use strict";

/**
 * @param {Object} awsSdk
 * @param {Object} config
 * @param {Object} path
 * @param {promise~instance} promise
 * @param {util~instance} util
 * @return {email~instance}
 */
module.exports = (awsSdk, config, path, promise, util) => {
    var fromAddress, sesAsync;


    /**
     * Sends an email using a template and additional data.
     *
     * @param {string} recipient
     * @param {string} subject
     * @param {string} text
     * @param {string} html
     * @return {Promise.<*>}
     */
    function sendAsync(recipient, subject, text, html) {
        return sesAsync.sendEmailAsync({
            Destination: {
                ToAddresses: [
                    recipient
                ]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "utf-8",
                        Data: html
                    },
                    Text: {
                        Charset: "utf-8",
                        Data: text
                    }
                },
                Subject: {
                    Charset: "utf-8",
                    Data: subject.trim()
                }
            },
            Source: fromAddress
        });
    }

    fromAddress = config.email.from;
    sesAsync = promise.promisifyAll(new awsSdk.SES(util.clone(config.email.ses)));

    return {
        sendAsync
    };
};