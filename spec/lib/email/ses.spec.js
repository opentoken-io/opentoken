"use strict";

describe("email/ses", () => {
    var configMock, create, sesInstance;

    beforeEach(() => {
        var awsSdkMock, promiseMock, util;

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
                    accessKeyId: "abcd",
                    some: "settings",
                    secretAccessKey: "efgh"
                }
            }
        };
        promiseMock = require("../../mock/promise-mock")();
        util = require("../../../lib/util")();
        create = () => {
            return require("../../../lib/email/ses")(awsSdkMock, configMock, promiseMock, util);
        };
    });
    it("initializes awsSdk", () => {
        create();
        expect(sesInstance).not.toBe(null);
        expect(sesInstance.params).toEqual({
            accessKeyId: "abcd",
            some: "settings",
            secretAccessKey: "efgh"
        });
    });
    it("eliminates empty keys", () => {
        configMock.email.ses.accessKeyId = "";
        configMock.email.ses.secretAccessKey = "";
        create();
        expect(sesInstance).not.toBe(null);
        expect(sesInstance.params).toEqual({
            some: "settings"
        });
    });
    describe("with an instance", () => {
        var ses;

        beforeEach(() => {
            ses = create();
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
});
