"use strict";

describe("storage", () => {
    var containerMock,create;

    beforeEach(() => {
        containerMock = jasmine.createSpyObj("containerMock", [
            "call"
        ]);
        create = (config) => {
            return require("../lib/storage")(config, containerMock);
        };
    });
    it("finds a storage engine", () => {
        expect(() => {
            create({
                storage: {
                    engine: "s3"
                }
            });
        }).not.toThrow();
        expect(containerMock.call).toHaveBeenCalled();
    });
    it("has no config options", () => {
        expect(() => {
            create({});
        }).toThrow("Storage Engine not set");
    });
    it("has no config options for storage engine", () => {
        expect(() => {
            create({
                storage: {}
            });
        }).toThrow("Storage Engine not set");
    });
    it("has config option for non-existent engine", () => {
        expect(() => {
            create({
                storage: {
                    engine: "notThere"
                }
            });
        }).toThrow("Could not find Storage Engine: notThere");
    });
});