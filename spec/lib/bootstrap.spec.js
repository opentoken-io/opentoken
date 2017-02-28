"use strict";

describe("bootstrap", () => {
    var baseDir, bootstrap, config, tv4, validator;

    beforeEach(() => {
        var path, promise;

        baseDir = __dirname.replace(/\/spec(\/.*)?$/, "/");
        config = require("../../config.json");
        path = require("path");
        promise = require("../mock/promise-mock")();
        tv4 = require("tv4");
        tv4 = require("tv4-file-loader")(tv4);
        spyOn(tv4, "addSchema").andCallThrough();
        spyOn(tv4, "loadSchemaFolderAsync").andCallThrough();
        spyOn(tv4, "validateResult").andCallThrough();
        spyOn(tv4, "getMissingUris").andCallThrough();
        validator = require("validator");
        bootstrap = () => {
            var real;

            real = require("../../lib/bootstrap")(config, path, promise, tv4, validator);

            return real(baseDir);
        };
    });
    it("passes with stock config", () => {
        return bootstrap().then(() => {
            expect(tv4.loadSchemaFolderAsync).toHaveBeenCalledWith(`${baseDir}schema`);
        });
    });
    it("errors when config is a string", () => {
        config = "test";

        return bootstrap().then(jasmine.fail, (err) => {
            expect(err.toString()).toContain("Configuration is not an object");
        });
    });
    it("errors when config is null", () => {
        config = null;

        return bootstrap().then(jasmine.fail, (err) => {
            expect(err.toString()).toContain("Configuration is not an object");
        });
    });
    it("errors when schemaPath is undefined", () => {
        config = {};

        return bootstrap().then(jasmine.fail, (err) => {
            expect(err.toString()).toContain("config.schemaPath is not set");
        });
    });
    it("errors when there are missing schemas", () => {
        tv4.getMissingUris.andReturn([
            "/schema"
        ]);

        return bootstrap().then(jasmine.fail, (err) => {
            expect(err.toString()).toContain("Unresolved schema references");
        });
    });
    it("errors when the schema does not validate", () => {
        tv4.validateResult.andReturn({
            valid: false,
            error: {
                dataPath: "x/y",
                message: "Oh noes!",
                schemaPath: "x/y"
            }
        });

        return bootstrap().then(jasmine.fail, (err) => {
            expect(err.toString()).toContain("Config did not validate");
        });
    });
    it("added the email format to tv4 correctly", () => {
        var emailSchema, invalidResult, validResult;

        emailSchema = {
            type: "string",
            format: "email"
        };

        return bootstrap().then(() => {
            validResult = tv4.validateResult("someone@example.net", emailSchema);
            expect(validResult).toEqual(jasmine.any(Object));
            expect(validResult.valid).toBe(true);
            invalidResult = tv4.validateResult("someone", emailSchema);
            expect(invalidResult).toEqual(jasmine.any(Object));
            expect(invalidResult.valid).toBe(false);
        });
    });
});
