"use strict";

describe("email/ses", () => {
    var ses, sesInstance;

    beforeEach(() => {
        var awsSdkMock, configMock, path, promiseMock, utilMock;

        /**
         * Fake S3 class
         */
        class SesFake {
            /**
             * Set up spies on the methods
             *
             * @param {*} params No influence on this class
             */
            constructor(params) {
                this.params = params;
                this.sendEmail = jasmine.createSpy("sendEmail").andCallFake((emailConfig, callback) => {
                    this.emailConfig = emailConfig;
                    callback();
                });

                // Save a copy for easier testing.
                /* eslint consistent-this:"off" */
                sesInstance = this;
            }
        }

        sesInstance = null;
        awsSdkMock = {
            SES: SesFake
        };
        configMock = {
            email: {
                from: "testUser@example.com",
                ses: {
                    some: "settings"
                }
            }
        };
        path = require("path");
        promiseMock = require("../../mock/promise-mock")();
        utilMock = require("../../mock/util-mock")();

        ses = require("../../../lib/email/ses")(awsSdkMock, configMock, path, promiseMock, utilMock);
    });
    it("initializes awsSdk", () => {
        expect(sesInstance).not.toBe(null);
        expect(sesInstance.params).toEqual({
            some: "settings"
        });
    });
    it("sends an email", () => {
        return ses.sendAsync("dest@example.com", "subj trimmed\n", "text untrimmed\n", "html untrimmed\n").then(() => {
            expect(sesInstance.sendEmail).toHaveBeenCalledWith({
                Destination: {
                    ToAddresses: [
                        "dest@example.com"
                    ]
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: "utf-8",
                            Data: "html untrimmed\n"
                        },
                        Text: {
                            Charset: "utf-8",
                            Data: "text untrimmed\n"
                        }
                    },
                    Subject: {
                        Charset: "utf-8",
                        Data: "subj trimmed"
                    }
                },
                Source: "testUser@example.com"
            }, jasmine.any(Function));
        });
    });
});
