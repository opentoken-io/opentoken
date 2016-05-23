"use strict";

describe("bootstrap", () => {
    var baseDir, bootstrap, config, schemaMock;

    beforeEach(() => {
        var path, promise;

        baseDir = __dirname.replace(/\/spec(\/.*)?$/, "/");
        config = require("../../config.json");
        path = require("path");
        promise = require("../mock/promise-mock");
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
    it("passes with stock config", (done) => {
        bootstrap().then(() => {
            expect(schemaMock.loadSchemaFolderAsync).toHaveBeenCalledWith(`${baseDir}schema/`);
        }).then(done, done);
    });
    it("errors when config is a string", (done) => {
        config = "test";
        jasmine.testPromiseFailure(bootstrap(), "Configuration is not an object", done);
    });
    it("errors when config is null", (done) => {
        config = null;
        jasmine.testPromiseFailure(bootstrap(), "Configuration is not an object", done);
    });
    it("errors when schemaPath is undefined", (done) => {
        config = {};
        jasmine.testPromiseFailure(bootstrap(), "config.schemaPath is not set", done);
    });
    it("errors when there are missing schemas", (done) => {
        schemaMock.getMissingSchemas.andReturn([
            "/schema"
        ]);
        jasmine.testPromiseFailure(bootstrap(), "Unresolved schema references", done);
    });
    it("errors when the schema does not validate", (done) => {
        schemaMock.validate.andReturn({
            error: {
                dataPath: "x/y",
                message: "Oh noes!",
                schemaPath: "x/y"
            }
        });
        jasmine.testPromiseFailure(bootstrap(), "Config did not validate", done);
    });
});
