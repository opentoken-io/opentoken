"use strict";

describe("schema", () => {
    var globMock, path, promiseMock, schema;

    beforeEach(() => {
        var fs, tv4, validator;

        fs = require("fs");
        path = require("path");
        spyOn(path, "resolve").andCallThrough();
        globMock = jasmine.createSpy("globMock");
        validator = require("validator");
        promiseMock = require("../mock/promise-mock")();
        tv4 = require("tv4");
        spyOn(tv4, "addSchema").andCallThrough();
        spyOn(fs, "readFile").andCallFake((fn, callback) => {
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

        schema = require("../../lib/schema")(promiseMock.promisifyAll(fs), globMock, path, promiseMock, tv4, validator);
    });
    describe(".getMissingSchemas()", () => {
        it("reports on missing schemas", () => {
            return schema.loadSchemaAsync("./missing-one.json", "./").then(() => {
                expect(schema.getMissingSchemas()).toEqual([
                    "/other-schema"
                ]);
            });
        });
    });
    describe(".loadSchemaAsync()", () => {
        it("loads a schema with an ID and validates against it", () => {
            return schema.loadSchemaAsync("./email.json", "./").then(() => {
                expect(() => {
                    schema.validate("someone@example.net", "/email.json");
                }).not.toThrow();
            });
        });
        it("rejects the promise when a schema has the wrong ID", () => {
            return schema.loadSchemaAsync("./a/b/c/d/number.json", "./").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Schema had wrong ID");
            });
        });
        it("loads a schema which cannot be parsed", () => {
            return schema.loadSchemaAsync("./email-parse-error.json", "./").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Unable to parse file: ./email-parse-error.json");
            });
        });
        it("tries to a schema which is not present", () => {
            return schema.loadSchemaAsync("./email-not-there.json", "./").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Unable to parse file: ./email-not-there.json");
            });
        });
    });
    describe(".loadSchemaFolderAsync()", () => {
        it("loads schemas in folder and validates against them", () => {
            path.resolve.andCallFake((a, b) => {
                return a + b;
            });
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

            return schema.loadSchemaFolderAsync("./folder/").then(() => {
                var result;

                expect(() => {
                    result = schema.validate("someone@example.net", "/folder/email.json");
                }).not.toThrow();
                expect(result).toBe(null);
                expect(() => {
                    result = schema.validate(5, "/folder/folder/number.json");
                }).not.toThrow();
                expect(result).toBe(null);
            });
        });
    });
    describe(".validate()", () => {
        it("loads a schema and validates against it", () => {
            return schema.loadSchemaAsync("./email.json", "./").then(() => {
                var result;

                expect(schema.validate("someone@example.net", "/email.json")).toBe(null);
                result = schema.validate("someone", "/email.json");
                expect(result).toEqual(jasmine.any(Object));
                expect(result.valid).toBe(false);
            });
        });
        it("tries to validate against a non-present schema", () => {
            expect(() => {
                schema.validate("something", "notThere");
            }).toThrow("Schema is not loaded: notThere");
        });
    });
});
