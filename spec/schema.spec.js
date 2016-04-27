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
        fs.readFileAsync.andCallFake((fn) => {
            if (fn.match("email.json")) {
                return promiseMock.resolve(schemaEmail);
            }

            if (fn.match("number.json")) {
                return promiseMock.resolve(schemaNumber);
            }

            return promiseMock.reject("Invalid file: " + fn.toString());
        });
        nodeValidator = require("validator");
        promiseMock = require("./mock/promise-mock");
        tv4 = require("tv4");
        schema = require("../lib/schema")(fs, nodeValidator, promiseMock, tv4);
    });
    describe(".loadSchemaAsync()", () => {
        it("loads a schema and validates against it", (done) => {
            tv4.addSchema = jasmine.createSpy("tv4.addSchema").andCallThrough();
            schema.loadSchemaAsync("./email.json").then(() => {
                expect(schema.validate("someone@example.net", "email")).toBe(true);
                expect(schema.validate("someone", "email")).toBe(false);
            }).then(done, done);
        });
    });
    describe(".loadSchemaFolderAsync()", () => {
        it("loads schemas and validates against them", (done) => {
            fs.readdirAsync.andCallFake((fn) => {
                if (fn.match("/folder/")) {
                    return promiseMock.resolve([
                        "email.json",
                        "number.json"
                    ]);
                }

                return promiseMock.reject("Invalid folder: " + fn.toString());
            });
            schema.loadSchemaFolderAsync("/folder/").then(() => {
                expect(schema.validate("someone@example.net", "email")).toBe(true);
                expect(schema.validate("someone", "email")).toBe(false);
                expect(schema.validate(5, "number")).toBe(true);
                expect(schema.validate(2, "number")).toBe(false);
            }).then(done, done);
        });
    });
});