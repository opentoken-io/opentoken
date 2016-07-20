"use strict";

describe("bootstrap", () => {
    var baseDir, bootstrap, config, schemaMock;

    beforeEach(() => {
        var path, promise;

        baseDir = __dirname.replace(/\/spec(\/.*)?$/, "/");
        config = require("../../config.json");
        path = require("path");
        promise = require("../mock/promise-mock")();
        schemaMock = jasmine.createSpyObj("schema", [
            "getMissingSchemas",
            "loadSchemaFolderAsync",
            "validate"
        ]);
        schemaMock.getMissingSchemas.andReturn([]);
        bootstrap = () => {
            var real;

            real = require("../../lib/bootstrap")(config, path, promise, schemaMock);

            return real(baseDir);
        };
    });
    it("passes with stock config", () => {
        return bootstrap().then(() => {
            expect(schemaMock.loadSchemaFolderAsync).toHaveBeenCalledWith(`${baseDir}schema`);
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
        schemaMock.getMissingSchemas.andReturn([
            "/schema"
        ]);

        return bootstrap().then(jasmine.fail, (err) => {
            expect(err.toString()).toContain("Unresolved schema references");
        });
    });
    it("errors when the schema does not validate", () => {
        schemaMock.validate.andReturn({
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
});
