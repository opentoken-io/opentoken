"use strict";

describe("storage", () => {
    var containerMock, create;

    beforeEach(() => {
        containerMock = jasmine.createSpyObj("containerMock", [
            "call"
        ]);
        create = (config) => {
            return require("../../lib/storage")(config, containerMock);
        };
    });
    it("finds a storage engine using configuartion option", () => {
        expect(() => {
            create({
                storage: {
                    engine: "s3"
                }
            });
        }).not.toThrow();
        expect(containerMock.call).toHaveBeenCalled();
    });
    it("throws an error without configuration options set", () => {
        expect(() => {
            create({});
        }).toThrow("Storage Engine not set");
    });
    it("throws an error without storage configuartion option for engine", () => {
        expect(() => {
            create({
                storage: {}
            });
        }).toThrow("Storage Engine not set");
    });
    it("throwns an error for an engine which does not exist", () => {
        expect(() => {
            create({
                storage: {
                    engine: "notThere"
                }
            });
        }).toThrow("Could not find Storage Engine: notThere");
    });
});
