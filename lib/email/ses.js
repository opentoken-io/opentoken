"use strict";

/**
 * @param {Object} awsSdk
 * @param {Object} config
 * @param {promise~instance} promise
 * @param {util~instance} util
 * @return {email~instance}
 */
module.exports = (awsSdk, config, promise, util) => {
    var fromAddress, sesAsync, sesConfig;


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
        return sendEmailAsync({
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
    sesConfig = util.clone(config.email.ses);

    if (sesConfig.accessKeyId === "") {
        delete sesConfig.accessKeyId;
    }

    if (sesConfig.secretAccessKey === "") {
        delete sesConfig.secretAccessKey;
    }

    const ses = new awsSdk.SES(sesConfig);
    const sendEmailAsync = promise.promisify(ses.sendEmail, {
        context: ses
    });

    return {
        sendAsync
    };
};
