"use strict";

describe("email", () => {
    var containerMock, create;

    beforeEach(() => {
        containerMock = jasmine.createSpyObj("containerMock", [
            "call"
        ]);
        create = (config) => {
            return require("../../lib/email")(config, containerMock);
        };
    });
    it("finds an email engine", () => {
        expect(() => {
            create({
                email: {
                    engine: "ses"
                }
            });
        }).not.toThrow();
        expect(containerMock.call).toHaveBeenCalled();
    });
    it("throws an error without configuration options set", () => {
        expect(() => {
            create({});
        }).toThrow();
    });
    it("throws an error without email engine configured", () => {
        expect(() => {
            create({
                email: {}
            });
        }).toThrow();
    });
    it("throws an error for an engine which does not exist", () => {
        expect(() => {
            create({
                email: {
                    engine: "notThere"
                }
            });
        }).toThrow(new Error("Could not find email engine: notThere"));
    });
});
