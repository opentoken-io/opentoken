"use strict";

describe("schema", () => {
    var globMock, schema;

    beforeEach(() => {
        var fs, nodeValidator, promiseMock, tv4;

        fs = require("fs");
        globMock = jasmine.createSpy("globMock");
        nodeValidator = require("validator");
        promiseMock = require("../mock/promise-mock");
        tv4 = require("tv4");
        tv4.addSchema = jasmine.createSpy("tv4.addSchema").andCallThrough();
        schema = require("../../lib/schema")(fs, globMock, nodeValidator, promiseMock, tv4);

        /**
         * Has to come after we've set up the factory because it doesn't exist till
         * we've initialized it.
         */
        fs.readFileAsync = jasmine.createSpy("fs.readFileAsync").andCallFake((fn) => {
            if (fn.match("email.json")) {
                return promiseMock.resolve(new Buffer('{"id": "email", "type": "string", "format": "email"}', "binary"));
            }

            if (fn.match("number.json")) {
                return promiseMock.resolve(new Buffer('{"id": "number", "type": "number", "minimum": 5}', "binary"));
            }

            if (fn.match("email-no-id.json")) {
                return promiseMock.resolve(new Buffer('{"type": "string", "format": "email"}', "binary"));
            }

            if (fn.match("email-parse-error.json")) {
                return promiseMock.resolve(new Buffer('{"type: "string", "format": "email"}', "binary"));
            }

            return promiseMock.reject("Invalid file: " + fn.toString());
        });
    });
    describe(".loadSchemaAsync()", () => {
        it("loads a schema and validates against it", (done) => {
            schema.loadSchemaAsync("./email.json").then(() => {
                expect(() => {
                    schema.validate("someone@example.net", "email");
                }).not.toThrow();
            }).then(done, done);
        });
        it("loads a schema not containing an id", (done) => {
            jasmine.testPromiseFailure(schema.loadSchemaAsync("./email-no-id.json"), "Schema did not contain id: ./email-no-id.json", done);
        });
        it("loads a schema which cannot be parsed", (done) => {
            jasmine.testPromiseFailure(schema.loadSchemaAsync("./email-parse-error.json"), "Unable to parse file: ./email-parse-error.json", done);
        });
        it("tries to a schema which is not present", (done) => {
            jasmine.testPromiseFailure(schema.loadSchemaAsync("./email-not-there.json"), "Unable to parse file: ./email-not-there.json", done);
        });
    });
    describe(".loadSchemaFolderAsync()", () => {
        it("loads schemas in folder and validates against them", (done) => {
            globMock.andCallFake((pattern, options, callback) => {
                expect(pattern).toBe("./folder/**/*.js");
                expect(options).toEqual({
                    strict: true,
                    nodir: true
                });
                callback(null, [
                    "/folder/email.json",
                    "/folder/folder/number.json"
                ]);
            });
            schema.loadSchemaFolderAsync("./folder/**/*.js").then(() => {
                expect(() => {
                    schema.validate("someone@example.net", "email");
                }).not.toThrow();
                expect(() => {
                    schema.validate(5, "number");
                }).not.toThrow();
            }).then(done, done);
        });
    });
    describe(".validate()", () => {
        it("loads a schema and validates against it", (done) => {
            schema.loadSchemaAsync("./email.json").then(() => {
                expect(schema.validate("someone@example.net", "email")).toBe(true);
                expect(schema.validate("someone", "email")).toBe(false);
            }).then(done, done);
        });
        it("tries to validate against a non-present schema", () => {
            expect(() => {
                schema.validate("something", "notThere");
            }).toThrow("Schema is not loaded: notThere");
        });
    });
});
