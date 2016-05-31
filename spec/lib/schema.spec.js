"use strict";

describe("schema", () => {
    var globMock, promiseMock, schema;

    beforeEach(() => {
        var fs, tv4, validator;

        fs = require("fs");
        globMock = jasmine.createSpy("globMock");
        validator = require("validator");
        promiseMock = require("../mock/promise-mock")();
        tv4 = require("tv4");
        tv4.addSchema = jasmine.createSpy("tv4.addSchema").andCallThrough();
        fs.readFile = jasmine.createSpy("fs.readFile").andCallFake((fn, callback) => {
            /**
             * Signify the end of the loading of a file.  If passed a string,
             * uses that string as a buffer.  If passed an object, first it
             * converts the object to a JSON string and then passes back the
             * string as a buffer.
             *
             * @param {(string|Object)} obj
             */
            function done(obj) {
                if (typeof obj !== "string") {
                    obj = JSON.stringify(obj);
                }

                callback(null, new Buffer(obj, "binary"));
            }

            if (fn.match("email.json")) {
                // No id in this file
                done({
                    type: "string",
                    format: "email"
                });

                return;
            }

            if (fn.match("number.json")) {
                // ID in this file
                done({
                    id: "/folder/folder/number.json",
                    type: "number",
                    minimum: 5
                });

                return;
            }

            if (fn.match("email-parse-error.json")) {
                done("{\"type: \"string\", \"format\": \"email\"}");

                return;
            }

            if (fn.match("missing-one.json")) {
                done({
                    type: "object",
                    properties: {
                        a: {
                            $ref: "/other-schema"
                        }
                    }
                });

                return;
            }

            callback(new Error(`Invalid file: ${fn.toString()}`));
        });

        schema = require("../../lib/schema")(promiseMock.promisifyAll(fs), globMock, promiseMock, tv4, validator);
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
                    schema.validate("someone@example.net", "/email.json");
                }).not.toThrow();
            }).then(done, done);
        });
        it("rejects the promise when a schema has the wrong ID", (done) => {
            jasmine.testPromiseFailure(schema.loadSchemaAsync("./a/b/c/d/number.json", "./"), "Schema had wrong ID", done);
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
            globMock.andCallFake((pattern, options) => {
                expect(pattern).toBe("./folder/**/*.json");
                expect(options).toEqual({
                    strict: true,
                    nodir: true
                });

                return promiseMock.resolve([
                    "/folder/email.json",
                    "/folder/folder/number.json"
                ]);
            });
            schema.loadSchemaFolderAsync("./folder/").then(() => {
                var result;

                expect(() => {
                    result = schema.validate("someone@example.net", "/folder/email.json");
                }).not.toThrow();
                expect(result).toBe(null);
                expect(() => {
                    result = schema.validate(5, "/folder/folder/number.json");
                }).not.toThrow();
                expect(result).toBe(null);
            }).then(done, done);
        });
    });
    describe(".validate()", () => {
        it("loads a schema and validates against it", (done) => {
            schema.loadSchemaAsync("./email.json", "./").then(() => {
                var result;

                expect(schema.validate("someone@example.net", "/email.json")).toBe(null);
                result = schema.validate("someone", "/email.json");
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
