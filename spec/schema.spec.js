"use strict";

describe("schema", () => {
    var globMock, schema;

    beforeEach(() => {
        var fs, nodeValidator, promiseMock, tv4;

        fs = require("fs");
        globMock = jasmine.createSpy("globMock");
        nodeValidator = require("validator");
        promiseMock = require("./mock/promise-mock");
        tv4 = require("tv4");
        tv4.addSchema = jasmine.createSpy("tv4.addSchema").andCallThrough();
        schema = require("../lib/schema")(fs, globMock, nodeValidator, promiseMock, tv4);

        /**
         * Has to come after we've set up the factory because it doesn't exist till
         * we've initialized it.
         */
        fs.readFileAsync = jasmine.createSpy("fs.readFileAsync").andCallFake((fn) => {
            if (fn.match("email.json")) {
                // No id in this file
                return promiseMock.resolve(new Buffer("{\"type\": \"string\", \"format\": \"email\"}", "binary"));
            }

            if (fn.match("number.json")) {
                // ID in this file
                return promiseMock.resolve(new Buffer("{\"id\": \"/folder/folder/number\", \"type\": \"number\", \"minimum\": 5}", "binary"));
            }

            if (fn.match("email-no-id.json")) {
                return promiseMock.resolve(new Buffer("{\"type\": \"string\", \"format\": \"email\"}", "binary"));
            }

            if (fn.match("email-parse-error.json")) {
                return promiseMock.resolve(new Buffer("{\"type: \"string\", \"format\": \"email\"}", "binary"));
            }

            if (fn.match("missing-one.json")) {
                return promiseMock.resolve(new Buffer("{\"type\": \"object\", \"properties\": {\"a\":{\"$ref\": \"/other-schema\"}}}", "binary"));
            }

            return promiseMock.reject("Invalid file: " + fn.toString());
        });
    });
    describe(".getMissingSchemas()", () => {
        it("reports on missing schemas", (done) => {
            schema.loadSchemaAsync("./missing-one.json", "./").then(() => {
                expect(schema.getMissingSchemas()).toEqual([
                    "/other-schema"
                ]);
            }).then(done, done);
        });
    });
    describe(".loadSchemaAsync()", () => {
        it("loads a schema with an ID and validates against it", (done) => {
            schema.loadSchemaAsync("./email.json", "./").then(() => {
                expect(() => {
                    schema.validate("someone@example.net", "/email");
                }).not.toThrow();
            }).then(done, done);
        });
        it("rejects the promise when a schema has the wrong ID", (done) => {
            jasmine.testPromiseFailure(schema.loadSchemaAsync("./a/b/c/d/number.json", "./"), "Schema had wrong ID", done);
        });
        it("loads a schema without an an id", (done) => {
            schema.loadSchemaAsync("./email-no-id.json", "./").then(done, done);
        });
        it("loads a schema which cannot be parsed", (done) => {
            jasmine.testPromiseFailure(schema.loadSchemaAsync("./email-parse-error.json", "./"), "Unable to parse file: ./email-parse-error.json", done);
        });
        it("tries to a schema which is not present", (done) => {
            jasmine.testPromiseFailure(schema.loadSchemaAsync("./email-not-there.json", "./"), "Unable to parse file: ./email-not-there.json", done);
        });
    });
    describe(".loadSchemaFolderAsync()", () => {
        it("loads schemas in folder and validates against them", (done) => {
            globMock.andCallFake((pattern, options, callback) => {
                expect(pattern).toBe("./folder/**/*.json");
                expect(options).toEqual({
                    strict: true,
                    nodir: true
                });
                callback(null, [
                    "/folder/email.json",
                    "/folder/folder/number.json"
                ]);
            });
            schema.loadSchemaFolderAsync("./folder/").then(() => {
                var result;

                expect(() => {
                    result = schema.validate("someone@example.net", "/folder/email");
                }).not.toThrow();
                expect(result).toBe(null);
                expect(() => {
                    result = schema.validate(5, "/folder/folder/number");
                }).not.toThrow();
                expect(result).toBe(null);
            }).then(done, done);
        });
    });
    describe(".validate()", () => {
        it("loads a schema and validates against it", (done) => {
            schema.loadSchemaAsync("./email.json", "./").then(() => {
                var result;

                expect(schema.validate("someone@example.net", "/email")).toBe(null);
                result = schema.validate("someone", "/email");
                expect(result).toEqual(jasmine.any(Object));
                expect(result.valid).toBe(false);
            }).then(done, done);
        });
        it("tries to validate against a non-present schema", () => {
            expect(() => {
                schema.validate("something", "notThere");
            }).toThrow("Schema is not loaded: notThere");
        });
    });
});
