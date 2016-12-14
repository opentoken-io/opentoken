"use strict";

describe("template", () => {
    var emailMock, fsAsyncMock, promiseMock, template;

    beforeEach(() => {
        var binaryBufferMock, configMock, mustache, path;

        binaryBufferMock = require("../mock/binary-buffer-mock")();
        configMock = {
            baseDir: "/some/fictional/folder",
            template: {
                emailPath: "emailPath"
            }
        };
        emailMock = require("../mock/email-mock")();
        fsAsyncMock = require("../mock/fs-async-mock")();
        mustache = require("mustache");
        path = require("path");
        promiseMock = require("../mock/promise-mock")();
        template = require("../../lib/template")(binaryBufferMock, configMock, emailMock, fsAsyncMock, mustache, path, promiseMock);
    });
    describe("exposed methods", () => {
        it("exposes a known list of methods", () => {
            expect(Object.keys(template).sort()).toEqual([
                "processTemplateAsync",
                "sendEmailAsync"
            ]);
        });
    });
    describe(".processTemplateAsync()", () => {
        it("resolves to the right path", () => {
            return template.processTemplateAsync({
                data: true
            }, "/base/path", "template/name").then(jasmine.fail, () => {
                expect(fsAsyncMock.readFileAsync).toHaveBeenCalledWith("/base/path/template/name");
            });
        });
        it("processes a template", () => {
            fsAsyncMock.readFileAsync.andCallFake(() => {
                return promiseMock.resolve(new Buffer("testing {{x}} value"));
            });

            return template.processTemplateAsync({
                x: "XXX"
            }, "/a", "b").then((content) => {
                expect(Buffer.isBuffer(content)).toBe(false);
                expect(content).toEqual("testing XXX value");
            });
        });
    });
    describe(".sendEmailAsync()", () => {
        it("builds the right templates", () => {
            fsAsyncMock.readFileAsync.andCallFake((path) => {
                return promiseMock.resolve(`${path} - {{data.c}}\n`);
            });

            return template.sendEmailAsync("test@example.com", "registration", {
                c: "cookie"
            }).then(() => {
                var pathBase;

                pathBase = "/some/fictional/folder/emailPath/registration";
                expect(emailMock.sendAsync).toHaveBeenCalledWith("test@example.com", `${pathBase}-subject - cookie`, `${pathBase}-text - cookie\n`, `${pathBase}-html - cookie\n`);
            });
        });
    });
});
