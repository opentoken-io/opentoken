"use strict";

describe("schema", () => {
    var fs, promiseMock, schema, schemaEmail, schemaNumber, tv4

    schemaEmail = new Buffer('{"id": "email", "type": "string", "format": "email"}', "binary");
    schemaNumber = new Buffer('{"id": "number", "type": "number", "minimum": 5}', "binary");
    beforeEach(() => {
        var nodeValidator;

        fs = jasmine.createSpyObj("fs", [
            "readdirAsync",
            "readFileAsync"
        ]);
        nodeValidator = require("validator");
        promiseMock = require("./mock/promise-mock");
        tv4 = require("tv4");
        schema = require("../lib/schema")(fs, nodeValidator, promiseMock, tv4);

    });
    describe(".loadSchemaAsync()", () => {
        it("loads a file successfully", (done) => {
            fs.readFileAsync.andCallFake((fn) => {
                if (fn == "./actualFile.json") {
                    return promiseMock.resolve(schemaEmail);
                }

                return promiseMock.reject("Invalid file: " + fn.toString());
            });
            tv4.addSchema = jasmine.createSpy("tv4.addSchema").andCallThrough();
            schema.loadSchemaAsync("./actualFile.json").then(() => {
            }).then(done, done);
        });
    });
    describe(".loadSchemaFolderAsync()", () => {
        it("loads a file successfully", (done) => {
            fs.readdirAsync.andCallFake((fn) => {
                if (fn == "/folder/") {
                    return promiseMock.resolve([
                        "email.json",
                        "number.json"
                    ]);
                }

                return promiseMock.reject("Invalid file: " + fn.toString());
            });
            fs.readFileAsync.andCallFake((fn) => {
                if (fn == "/folder/email.json") {
                    return promiseMock.resolve(schemaEmail);
                }

                if (fn == "/folder/number.json") {
                    return promiseMock.resolve(schemaNumber);
                }

                return promiseMock.reject("Invalid file: " + fn.toString());
            });
            schema.loadSchemaFolderAsync("/folder/").then(() => {
            }).then(done, done);
        });
    });
    describe(".validate()", () => {
        beforeEach(() => {
            fs.readFileAsync.andCallFake((fn) => {
                if (fn == "./email.json") {
                    return promiseMock.resolve(schemaEmail);
                }

                return promiseMock.reject("Invalid file: " + fn.toString());
            });
        });
        it("loads an email schema and validates email", (done) => {
            schema.loadSchemaAsync("./email.json").then(() => {
                expect(schema.validate("some.one@example.net", "email")).toBe(true);
            }).then(done, done);
        });
        it("loads an email schema and does not validate email", (done) => {
            schema.loadSchemaAsync("./email.json").then(() => {
                expect(schema.validate("some.one$%$%", "email")).toEqual(false);
            }).then(done, done);
        });
    });
});